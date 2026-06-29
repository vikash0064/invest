import fs from 'fs';
import path from 'path';
import compiledWorkflow from '../langgraph/workflow.js';
import Research from '../models/Research.js';
import mongoose from 'mongoose';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const LOCAL_DB_PATH = path.resolve('server/data/history.json');

// Ensure the local data directory exists
function ensureLocalDataDir() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Check if MongoDB is connected
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// Save to local file DB
function saveToLocalFile(record) {
  ensureLocalDataDir();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const history = JSON.parse(data);
    
    // Construct local mock model structure
    const localRecord = {
      _id: 'local_' + Math.random().toString(36).substr(2, 9),
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    history.unshift(localRecord);
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(history, null, 2), 'utf-8');
    return localRecord;
  } catch (error) {
    console.error('Failed to write to local history file:', error.message);
    throw error;
  }
}

// Read from local file DB
function getFromLocalFile(email) {
  ensureLocalDataDir();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const history = JSON.parse(data);
    const targetEmail = email || 'guest@alphainvest.ai';
    return history.filter(item => item.userEmail === targetEmail);
  } catch (error) {
    console.error('Failed to read from local history file:', error.message);
    return [];
  }
}

// Delete from local file DB
function deleteFromLocalFile(id) {
  ensureLocalDataDir();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    let history = JSON.parse(data);
    history = history.filter(item => item._id !== id);
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(history, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to delete from local history file:', error.message);
    return false;
  }
}

/**
 * Trigger company investment analysis using LangGraph
 * POST /api/research/analyze
 */
export const analyzeCompany = async (req, res) => {
  const { companyName } = req.body;
  
  if (!companyName) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  try {
    console.log(`[Research Controller] Initiating LangGraph workflow for query: "${companyName}"`);
    
    // Run the compiled LangGraph workflow
    const finalState = await compiledWorkflow.invoke({
      companyName: companyName
    });

    if (!finalState.symbol || !finalState.companyInfo) {
      throw new Error('Analysis completed but returned incomplete data.');
    }

    // Save report to database or fallback
    const userEmail = req.body.userEmail || req.headers['x-user-email'] || 'guest@alphainvest.ai';
    const record = {
      companyName: finalState.companyInfo.name,
      symbol: finalState.symbol,
      recommendation: finalState.recommendation.decision,
      confidence: finalState.recommendation.confidenceScore,
      summary: finalState.recommendation.reasoning,
      fullData: finalState,
      userEmail: userEmail
    };

    let savedRecord = null;
    let savedInMongo = false;

    if (isMongoConnected()) {
      try {
        savedRecord = await Research.create(record);
        savedInMongo = true;
        console.log(`[Research Controller] Report saved successfully in MongoDB.`);
      } catch (mongoError) {
        console.warn('MongoDB save failed, writing to local JSON file instead:', mongoError.message);
        savedRecord = saveToLocalFile(record);
      }
    } else {
      console.log('MongoDB disconnected, writing to local JSON file instead.');
      savedRecord = saveToLocalFile(record);
    }

    res.status(200).json({
      success: true,
      data: savedRecord,
      savedInMongo
    });
  } catch (error) {
    console.error('Error during company analysis:', error.message);
    res.status(500).json({
      error: 'An error occurred during investment research.',
      details: error.message
    });
  }
};

/**
 * Fetch research history list
 * GET /api/research/history
 */
export const getHistory = async (req, res) => {
  try {
    const targetEmail = req.query.email || req.headers['x-user-email'] || 'guest@alphainvest.ai';
    
    if (isMongoConnected()) {
      try {
        const history = await Research.find({ userEmail: targetEmail }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, history });
      } catch (mongoError) {
        console.warn('MongoDB fetch history failed, falling back to local file:', mongoError.message);
      }
    }
    
    const history = getFromLocalFile(targetEmail);
    res.status(200).json({ success: true, history, isLocalFallback: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history', details: error.message });
  }
};

/**
 * Delete a history item
 * DELETE /api/research/history/:id
 */
export const deleteHistory = async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'History ID is required' });
  }

  try {
    let deleted = false;
    
    if (isMongoConnected() && !id.startsWith('local_')) {
      try {
        const result = await Research.findByIdAndDelete(id);
        if (result) deleted = true;
        console.log(`[Research Controller] Deleted ID ${id} from MongoDB.`);
      } catch (mongoError) {
        console.warn('MongoDB delete failed, attempting local file delete:', mongoError.message);
      }
    }

    // Attempt local delete if not deleted yet
    if (!deleted) {
      deleted = deleteFromLocalFile(id);
    }

    if (deleted) {
      res.status(200).json({ success: true, message: 'History record deleted successfully' });
    } else {
      res.status(404).json({ error: 'History record not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete history record', details: error.message });
  }
};

/**
 * Suggest stock tickers based on query
 * GET /api/research/suggest?q=query
 */
export const suggestStocks = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(200).json({ success: true, suggestions: [] });

  try {
    const results = await yahooFinance.search(q);
    const suggestions = (results.quotes || [])
      .filter(item => item.quoteType === 'EQUITY')
      .map(item => ({
        symbol: item.symbol,
        name: item.shortname || item.longname || item.symbol,
        exchange: item.exchange || 'Unknown',
      }))
      .slice(0, 6);

    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error.message);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

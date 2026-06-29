import { StateGraph } from '@langchain/langgraph';
import yahooFinanceService from '../services/yahooFinanceService.js';
import llmService from '../services/llmService.js';

// Define the State structure for the graph
const workflowChannels = {
  companyName: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => ''
  },
  symbol: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => ''
  },
  companyInfo: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => null
  },
  financialAnalysis: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => null
  },
  newsList: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => []
  },
  chartData: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => []
  },
  financialHistory: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => []
  },
  newsSentiment: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => []
  },
  riskAnalysis: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => null
  },
  growthAnalysis: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => null
  },
  recommendation: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => null
  },
  swot: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => null
  },
  status: {
    value: (x, y) => (y !== undefined ? y : x),
    default: () => 'init'
  }
};

/**
 * Node 1: Validate Company Name & Resolve Ticker Ticker
 */
async function validateCompany(state) {
  console.log(`[LangGraph Node 1] Validating company: "${state.companyName}"`);
  const symbol = await yahooFinanceService.searchSymbol(state.companyName);
  return {
    symbol,
    status: 'symbol_validated'
  };
}

/**
 * Node 2: Collect Company Profile
 */
async function collectProfile(state) {
  console.log(`[LangGraph Node 2] Collecting profile for symbol: ${state.symbol}`);
  const details = await yahooFinanceService.getCompanyDetails(state.symbol);
  return {
    companyInfo: details.companyInfo,
    status: 'profile_collected'
  };
}

/**
 * Node 3: Collect Financial Data
 */
async function collectFinancials(state) {
  console.log(`[LangGraph Node 3] Collecting financials for symbol: ${state.symbol}`);
  // We already fetched details in parallel in the previous node to avoid redundant calls,
  // but let's re-extract it properly based on state
  const details = await yahooFinanceService.getCompanyDetails(state.symbol);
  return {
    financialAnalysis: details.financialAnalysis,
    financialHistory: details.financialHistory,
    status: 'financials_collected'
  };
}

/**
 * Node 4: Collect Latest News & Stock Chart Data
 */
async function collectNews(state) {
  console.log(`[LangGraph Node 4] Collecting news and chart data for symbol: ${state.symbol}`);
  const details = await yahooFinanceService.getCompanyDetails(state.symbol);
  return {
    newsList: details.newsList,
    chartData: details.chartData,
    status: 'news_collected'
  };
}

/**
 * Node 5: Analyze Risks
 */
async function analyzeRisks(state) {
  console.log(`[LangGraph Node 5] Analyzing risks for: ${state.symbol}`);
  // Analyze news sentiment first
  const sentimentNews = await llmService.analyzeNewsSentiment(state.companyInfo, state.newsList);
  
  // Perform analysis using LLM service (will return risks and swot)
  const fullAnalysis = await llmService.performCompleteAnalysis(
    state.companyInfo,
    state.financialAnalysis,
    sentimentNews
  );

  return {
    newsSentiment: sentimentNews,
    riskAnalysis: fullAnalysis.risks,
    swot: fullAnalysis.swot,
    status: 'risks_analyzed'
  };
}

/**
 * Node 6: Analyze Growth
 */
async function analyzeGrowth(state) {
  console.log(`[LangGraph Node 6] Analyzing growth for: ${state.symbol}`);
  // We can extract growth from the full analysis we ran earlier or re-run.
  // Re-running llmService.performCompleteAnalysis retrieves everything.
  const fullAnalysis = await llmService.performCompleteAnalysis(
    state.companyInfo,
    state.financialAnalysis,
    state.newsSentiment
  );

  return {
    growthAnalysis: fullAnalysis.growth,
    status: 'growth_analyzed'
  };
}

/**
 * Node 7: Generate Final Recommendation
 */
async function generateRecommendation(state) {
  console.log(`[LangGraph Node 7] Generating final recommendation for: ${state.symbol}`);
  const fullAnalysis = await llmService.performCompleteAnalysis(
    state.companyInfo,
    state.financialAnalysis,
    state.newsSentiment
  );

  return {
    recommendation: fullAnalysis.recommendation,
    status: 'recommendation_generated'
  };
}

// Instantiate and compile the LangGraph workflow
const workflow = new StateGraph({ channels: workflowChannels })
  .addNode('validateCompany', validateCompany)
  .addNode('collectProfile', collectProfile)
  .addNode('collectFinancials', collectFinancials)
  .addNode('collectNews', collectNews)
  .addNode('analyzeRisks', analyzeRisks)
  .addNode('analyzeGrowth', analyzeGrowth)
  .addNode('generateRecommendation', generateRecommendation)
  
  // Set execution flow
  .addEdge('__start__', 'validateCompany')
  .addEdge('validateCompany', 'collectProfile')
  .addEdge('collectProfile', 'collectFinancials')
  .addEdge('collectFinancials', 'collectNews')
  .addEdge('collectNews', 'analyzeRisks')
  .addEdge('analyzeRisks', 'analyzeGrowth')
  .addEdge('analyzeGrowth', 'generateRecommendation')
  .addEdge('generateRecommendation', '__end__');

const compiledWorkflow = workflow.compile();

export default compiledWorkflow;
export { compiledWorkflow as workflow };

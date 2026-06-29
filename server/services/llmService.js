import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import axios from 'axios';

class LLMService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.hasKey = !!(this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY');
  }

  /**
   * Helper to execute Gemini requests. Handles LangChain or direct REST fallback.
   */
  async _callGemini(systemPrompt, userPrompt) {
    const key = process.env.GEMINI_API_KEY || this.apiKey;
    
    if (!key) {
      console.warn('No Gemini API key found, using local analytical engine fallback.');
      return null;
    }

    try {
      // Method 1: Try using LangChain's ChatGoogleGenerativeAI
      try {
        const model = new ChatGoogleGenerativeAI({
          apiKey: key,
          modelName: 'gemini-2.5-flash',
          maxOutputTokens: 2048,
          temperature: 0.2
        });
        
        const response = await model.invoke([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]);
        
        return response.content;
      } catch (lcError) {
        console.warn('LangChain Gemini call failed, trying direct HTTP REST call...', lcError.message);
        
        // Method 2: Direct REST call to Gemini API (extremely reliable and avoids package version mismatch issues)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
        const requestBody = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\nUser Request/Data:\n${userPrompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048
          }
        };

        const response = await axios.post(url, requestBody, {
          headers: { 'Content-Type': 'application/json' }
        });

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error('Empty response from REST API');
      }
    } catch (error) {
      console.error('All Gemini API calls failed:', error.message);
      return null;
    }
  }

  /**
   * Helper to clean and parse JSON response from LLM
   */
  _parseJson(text) {
    if (!text) return null;
    try {
      // Find JSON block if wrapped in markdown
      let jsonStr = text.trim();
      const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1].trim();
      }
      
      // If it still has markdown markers
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```[a-zA-Z]*/, '').replace(/```$/, '').trim();
      }
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse JSON from LLM content:', error.message);
      // Return null, parent will trigger local analysis fallback
      return null;
    }
  }

  /**
   * Perform News Sentiment Analysis
   */
  async analyzeNewsSentiment(companyInfo, newsList) {
    if (newsList.length === 0) return [];
    
    const systemPrompt = `You are a financial analyst. Analyze the sentiment of the following news articles for the company ${companyInfo.name} (${companyInfo.symbol}).
Return a JSON array containing the exact same list of news, but with a new "sentiment" field added to each news item.
The value of the "sentiment" field MUST be one of: "Positive", "Neutral", "Negative".
Provide a very brief 1-sentence "sentimentReason" for each.
Do not return any other text besides the JSON array.`;

    const userPrompt = JSON.stringify(newsList, null, 2);
    const resultText = await this._callGemini(systemPrompt, userPrompt);
    const parsed = this._parseJson(resultText);
    
    if (parsed && Array.isArray(parsed)) {
      return parsed;
    }

    // Fallback: local heuristic-based news sentiment analyzer
    console.log('Using local heuristic news sentiment analyzer...');
    const positiveKeywords = ['grow', 'gain', 'rise', 'record', 'profit', 'dividend', 'acquire', 'launch', 'ai', 'expansion', 'buy', 'upgrade', 'bullish', 'exceed', 'beat', 'innovation', 'strong'];
    const negativeKeywords = ['drop', 'fall', 'loss', 'decline', 'fine', 'lawsuit', 'sue', 'layoff', 'cut', 'debt', 'risk', 'bearish', 'downgrade', 'miss', 'investigation', 'scam', 'weak', 'shrink'];

    return newsList.map(item => {
      const text = (item.title + ' ' + item.summary).toLowerCase();
      let posCount = 0;
      let negCount = 0;
      
      positiveKeywords.forEach(k => { if (text.includes(k)) posCount++; });
      negativeKeywords.forEach(k => { if (text.includes(k)) negCount++; });
      
      let sentiment = 'Neutral';
      let sentimentReason = 'Headline represents general business update or neutral announcement.';
      
      if (posCount > negCount) {
        sentiment = 'Positive';
        sentimentReason = 'Headline highlights growth, products, or financial gains.';
      } else if (negCount > posCount) {
        sentiment = 'Negative';
        sentimentReason = 'Headline highlights risks, legal challenges, or declines.';
      }
      
      return { ...item, sentiment, sentimentReason };
    });
  }

  /**
   * Perform SWOT Analysis, Risk Scoring, Growth Analysis, and Final Recommendation
   * Combined request to save tokens and avoid multiple slow roundtrips.
   */
  async performCompleteAnalysis(companyInfo, financialAnalysis, sentimentNews) {
    const systemPrompt = `You are a seasoned Wall Street equity research analyst.
Perform an in-depth financial, risk, and SWOT analysis for ${companyInfo.name} (${companyInfo.symbol}) and render an investment recommendation: INVEST or PASS.

You must respond with a strictly formatted JSON object containing the following structure:
{
  "swot": {
    "strengths": ["string", "string", ...],
    "weaknesses": ["string", "string", ...],
    "opportunities": ["string", "string", ...],
    "threats": ["string", "string", ...]
  },
  "risks": {
    "categories": {
      "competition": { "score": 1-10, "reason": "string" },
      "debt": { "score": 1-10, "reason": "string" },
      "regulations": { "score": 1-10, "reason": "string" },
      "economicConditions": { "score": 1-10, "reason": "string" },
      "technologyRisks": { "score": 1-10, "reason": "string" },
      "supplyChain": { "score": 1-10, "reason": "string" },
      "politicalRisks": { "score": 1-10, "reason": "string" }
    },
    "overallScore": 1-10
  },
  "growth": {
    "categories": {
      "revenueGrowth": { "score": 1-10, "reason": "string" },
      "industryGrowth": { "score": 1-10, "reason": "string" },
      "innovation": { "score": 1-10, "reason": "string" },
      "aiAdoption": { "score": 1-10, "reason": "string" },
      "futurePlans": { "score": 1-10, "reason": "string" },
      "expansion": { "score": 1-10, "reason": "string" }
    },
    "overallScore": 1-10
  },
  "recommendation": {
    "decision": "INVEST" or "PASS",
    "confidenceScore": 0-100,
    "reasoning": "string",
    "pros": ["string", "string", ...],
    "cons": ["string", "string", ...],
    "risks": ["string", "string", ...],
    "futureOutlook": "string"
  }
}

Guidelines:
- Leverage ratios (debt-to-equity), operating margins, P/E ratio, and revenue growth are key factors.
- Review recent news sentiment for product launches or headwinds.
- Do not hallucinate financial numbers. If metrics are missing ("Data unavailable"), note that in your reasoning.
- Provide objective, highly professional analysis. Explain your decisions.
- Do not output any markdown besides the JSON object.`;

    const userPrompt = JSON.stringify({
      companyInfo,
      financialAnalysis,
      newsAndSentiment: sentimentNews
    }, null, 2);

    const resultText = await this._callGemini(systemPrompt, userPrompt);
    const parsed = this._parseJson(resultText);
    
    if (parsed) return parsed;

    // Local Fallback: Rule-Based Financial Synthesis Model
    console.warn('Using rule-based local financial analysis fallback engine...');
    return this._runLocalRuleBasedAnalysis(companyInfo, financialAnalysis, sentimentNews);
  }

  /**
   * High-fidelity local rule-based investment analyzer
   * Generates highly detailed analysis based on Yahoo Finance data when LLM key is absent or fails.
   */
  _runLocalRuleBasedAnalysis(companyInfo, financials, news) {
    const isAvailable = (val) => val !== undefined && val !== null && val !== 'Data unavailable';
    
    // Parse margins, growth, and leverage for formulas
    const pe = isAvailable(financials.peRatio) ? parseFloat(financials.peRatio) : 25;
    const revGrowthVal = isAvailable(financials.revenueGrowth) ? parseFloat(financials.revenueGrowth) : 5;
    const profitMarginVal = isAvailable(financials.profitMargin) ? parseFloat(financials.profitMargin) : 10;
    const roeVal = isAvailable(financials.roe) ? parseFloat(financials.roe) : 12;
    const debtToEquityVal = isAvailable(financials.debtToEquity) ? parseFloat(financials.debtToEquity) / 100 : 0.8; // yahoo returns as percent or ratio
    const currentRatioVal = isAvailable(financials.currentRatio) ? parseFloat(financials.currentRatio) : 1.5;

    // 1. SWOT Analysis generator
    const strengths = [];
    const weaknesses = [];
    const opportunities = [];
    const threats = [];

    // Strengths
    if (profitMarginVal > 15) strengths.push(`High profitability with net margin of ${financials.profitMargin}.`);
    else strengths.push(`Established market presence as ${companyInfo.name} in the ${companyInfo.industry} sector.`);
    if (revGrowthVal > 10) strengths.push(`Strong top-line acceleration with year-over-year growth of ${financials.revenueGrowth}.`);
    if (roeVal > 15) strengths.push(`Exceptional return on equity (${financials.roe}) demonstrating efficient capital allocation.`);
    if (currentRatioVal > 1.8) strengths.push(`Liquid balance sheet with a solid current ratio of ${currentRatioVal}.`);

    // Weaknesses
    if (debtToEquityVal > 1.5) weaknesses.push(`Highly leveraged capital structure with a high debt-to-equity ratio.`);
    if (pe > 40) weaknesses.push(`Premium valuation with a P/E ratio of ${pe.toFixed(1)}, raising multiple contraction risk.`);
    if (profitMarginVal < 5) weaknesses.push(`Thin profit margins (${financials.profitMargin}), making it vulnerable to cost inflation.`);
    if (revGrowthVal < 2) weaknesses.push(`Slowing top-line growth (${financials.revenueGrowth}), indicating business maturation.`);
    if (weaknesses.length === 0) weaknesses.push("Exposure to cyclical economic conditions and high capital expenditure demands.");

    // Opportunities
    opportunities.push(`Expanding addressable market through AI integration and digitalization in the ${companyInfo.industry} space.`);
    opportunities.push("Unlocking efficiency gains through supply chain restructuring and global product expansion.");
    if (isAvailable(financials.dividendYield) && parseFloat(financials.dividendYield) > 1.5) {
      opportunities.push("Increasing capital returns to shareholders via steady buybacks and dividend growth.");
    }

    // Threats
    threats.push("Intensifying competitor offerings squeezing pricing power and margins.");
    threats.push("Evolving regulatory policies regarding data privacy, labor compliance, and global trade tariffs.");
    threats.push("Macroeconomic headwinds, including potential interest rate volatility and inflation.");

    // 2. Risk Scoring (1-10)
    const riskScores = {
      competition: { score: pe > 30 ? 7 : 5, reason: `Valuation premium implies high expectations relative to market competitors.` },
      debt: { score: debtToEquityVal > 1.2 ? 8 : (debtToEquityVal > 0.6 ? 5 : 3), reason: `Leverage ratio is currently evaluated at a debt-to-equity of ${debtToEquityVal.toFixed(2)}.` },
      regulations: { score: 6, reason: "Ongoing scrutiny over antitrust, cross-border commerce, and compliance." },
      economicConditions: { score: 5, reason: "Vulnerability to general consumer discretionary spending trends." },
      technologyRisks: { score: companyInfo.sector.toLowerCase().includes('tech') ? 6 : 4, reason: "Requires constant innovation to prevent technological obsolescence." },
      supplyChain: { score: 5, reason: "Exposure to raw material shortages and global shipping bottlenecks." },
      politicalRisks: { score: profileCompanyIsGlobal(companyInfo.description) ? 6 : 3, reason: "Global footprint exposes earnings to geopolitical tensions and currency fluctuations." }
    };
    const overallRiskScore = Math.round(Object.values(riskScores).reduce((acc, curr) => acc + curr.score, 0) / Object.keys(riskScores).length);

    // Helper to determine if global
    function profileCompanyIsGlobal(desc) {
      const txt = desc.toLowerCase();
      return txt.includes('global') || txt.includes('international') || txt.includes('europe') || txt.includes('asia');
    }

    // 3. Growth Scoring (1-10)
    const growthScores = {
      revenueGrowth: { score: revGrowthVal > 15 ? 9 : (revGrowthVal > 8 ? 7 : (revGrowthVal > 2 ? 5 : 3)), reason: `Year-over-year revenue expansion rate of ${financials.revenueGrowth}.` },
      industryGrowth: { score: companyInfo.sector.toLowerCase().includes('technology') ? 8 : 6, reason: `Growth is anchored to secular tailwinds within the ${companyInfo.sector} sector.` },
      innovation: { score: companyInfo.description.toLowerCase().includes('ai') || companyInfo.description.toLowerCase().includes('cloud') ? 8 : 6, reason: "Consistent R&D investment aimed at capturing high-margin markets." },
      aiAdoption: { score: companyInfo.description.toLowerCase().includes('technology') ? 8 : 5, reason: "Integrating predictive models and automated workflows into core segments." },
      futurePlans: { score: 7, reason: "Strategic pivot toward sustainable products and expansion of digital ecosystems." },
      expansion: { score: 6, reason: "Leveraging core branding to launch adjacent services and enter emerging economies." }
    };
    const overallGrowthScore = Math.round(Object.values(growthScores).reduce((acc, curr) => acc + curr.score, 0) / Object.keys(growthScores).length);

    // 4. Recommendation & Decision Rules
    // Rule-based decision logic
    let decision = 'PASS';
    let confidenceScore = 65;
    const pros = [];
    const cons = [];

    // Formulate pros and cons
    if (revGrowthVal > 5) pros.push("Strong revenue momentum and steady customer expansion.");
    if (profitMarginVal > 12) pros.push("Highly efficient operation with superior margins.");
    if (currentRatioVal > 1.2) pros.push("Healthy short-term liquidity position to absorb shocks.");
    
    if (pe > 35) cons.push("High valuation multiples could limit near-term price appreciation.");
    if (debtToEquityVal > 1.5) cons.push("Significant debt burden creates leverage vulnerabilities.");
    if (revGrowthVal < 2) cons.push("Maturing product line leads to sluggish growth rates.");

    // Decision Logic
    const meetsGrowth = revGrowthVal > 6;
    const meetsMargin = profitMarginVal > 8;
    const safeDebt = debtToEquityVal < 1.8;
    const reasonableValuation = pe < 35;

    let score = 0;
    if (meetsGrowth) score += 2;
    if (meetsMargin) score += 2;
    if (safeDebt) score += 2;
    if (reasonableValuation) score += 2;
    if (roeVal > 12) score += 2;

    if (score >= 6) {
      decision = 'INVEST';
      confidenceScore = 70 + (score * 2.5);
    } else {
      decision = 'PASS';
      confidenceScore = 55 + ((10 - score) * 3);
    }

    if (confidenceScore > 98) confidenceScore = 95;
    if (confidenceScore < 10) confidenceScore = 15;

    // Reasonings
    const reasoning = `Based on our automated rule-based analysis, ${companyInfo.name} exhibits a ${decision === 'INVEST' ? 'favorable' : 'neutral-to-concerning'} profile. It operates with a net profit margin of ${financials.profitMargin} and revenue growth of ${financials.revenueGrowth}. The capital structure is leveraged at a debt-to-equity ratio of ${debtToEquityVal.toFixed(2)}, with short-term liquidity represented by a current ratio of ${currentRatioVal}. Given a trailing price-to-earnings ratio of ${financials.peRatio}, we recommend a ${decision} decision with ${confidenceScore}% confidence.`;

    const futureOutlook = `${companyInfo.name} is poised to navigate structural shifts in the global economy by leveraging its market-leading position. Opportunities in cloud computing, automation, and expanding markets offer long-term upside, though persistent regulatory scrutiny and competitive pressures in the ${companyInfo.industry} sector remain primary headwinds.`;

    return {
      swot: { strengths, weaknesses, opportunities, threats },
      risks: { categories: riskScores, overallScore: overallRiskScore },
      growth: { categories: growthScores, overallScore: overallGrowthScore },
      recommendation: {
        decision,
        confidenceScore,
        reasoning,
        pros,
        cons,
        risks: Object.entries(riskScores).filter(([_, v]) => v.score >= 6).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v.reason}`),
        futureOutlook
      }
    };
  }

  /**
   * Guess a company's stock ticker symbol using Gemini 2.5 Flash
   * @param {string} query - Misspelled or descriptive company name (e.g. "Gallant Ispat")
   * @returns {Promise<string|null>} Resolved ticker symbol or null
   */
  async guessTickerSymbol(query) {
    if (!query) return null;
    
    const systemPrompt = `You are a financial database resolver. Given a company name or query, you identify the most likely stock ticker symbol on major public exchanges (NYSE, NASDAQ, LSE, NSE, BSE, etc.).
Your response must be ONLY the uppercase ticker symbol (e.g. AAPL, TSLA, INFY.NS, RELIANCE.NS) and nothing else. No markdown, no punctuation, no conversational filler.
If the company is listed on an Indian exchange, prefer Indian symbols (e.g. INFYS -> INFY.NS, Reliance -> RELIANCE.NS).
If you cannot find any matching ticker, return "UNKNOWN".`;
    
    try {
      const resultText = await this._callGemini(systemPrompt, `Query: "${query}"`);
      if (resultText) {
        const cleaned = resultText.trim().toUpperCase().replace(/[^A-Z0-9\.\-]/g, '');
        if (cleaned && cleaned !== 'UNKNOWN' && cleaned.length <= 15) {
          return cleaned;
        }
      }
    } catch (err) {
      console.error('Failed to guess ticker using LLM:', err.message);
    }
    return null;
  }
}

export default new LLMService();

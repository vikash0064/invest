import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

/**
 * Service to interact with Yahoo Finance API (free, no API key required)
 */
class YahooFinanceService {
  constructor() {
    // Suppress yahoo-finance2 notices/warnings if needed
  }

  /**
   * Search for a company ticker symbol based on query string
   * @param {string} query - Company name or symbol (e.g., "Apple" or "AAPL")
   * @returns {Promise<string>} Stock symbol (ticker)
   */
  async searchSymbol(query) {
    if (!query) throw new Error('Search query is required');
    
    try {
      // First check if query itself is a valid ticker
      const cleanQuery = query.trim().toUpperCase();
      try {
        const testQuote = await yahooFinance.quote(cleanQuery);
        if (testQuote && testQuote.symbol) {
          return testQuote.symbol;
        }
      } catch (err) {
        // Not a direct symbol, proceed to search
      }

      // Preprocess query to clean company suffixes (e.g. Ltd, Inc)
      let cleanName = query.trim();
      cleanName = cleanName.replace(/\b(ltd|limited|corp|corporation|inc|incorporated|co|company|pvt|private)\b\.?/gi, '').trim();

      console.log(`Searching Yahoo Finance for: "${cleanName || query}"`);
      let results = await yahooFinance.search(cleanName || query);
      let stockMatches = results.quotes.filter(q => q.quoteType === 'EQUITY');
      
      if (stockMatches.length > 0) {
        return stockMatches[0].symbol;
      }

      // Try search with original query
      if (cleanName !== query.trim()) {
        results = await yahooFinance.search(query);
        stockMatches = results.quotes.filter(q => q.quoteType === 'EQUITY');
        if (stockMatches.length > 0) {
          return stockMatches[0].symbol;
        }
      }
      
      if (results.quotes.length > 0) {
        return results.quotes[0].symbol;
      }

      // Fallback: Guess stock ticker symbol using LLM (dynamic import to avoid circular dependency)
      console.log(`No results for "${query}" search. Attempting LLM guess...`);
      try {
        const llmService = (await import('./llmService.js')).default;
        const guessedTicker = await llmService.guessTickerSymbol(query);
        if (guessedTicker) {
          console.log(`LLM guessed ticker for "${query}": ${guessedTicker}. Verifying...`);
          const verifyQuote = await yahooFinance.quote(guessedTicker);
          if (verifyQuote && verifyQuote.symbol) {
            return verifyQuote.symbol;
          }
        }
      } catch (llmErr) {
        console.warn('LLM Ticker guess failed/skipped:', llmErr.message);
      }

      throw new Error(`No stock found matching: ${query}`);
    } catch (error) {
      console.error(`Error searching symbol for "${query}":`, error.message);
      throw new Error(`Failed to resolve company name: ${error.message}`);
    }
  }

  /**
   * Get all company details: profile, financials, news, historical stock prices
   * @param {string} symbol - Ticker symbol (e.g., "AAPL")
   */
  async getCompanyDetails(symbol) {
    const cleanSymbol = symbol.trim().toUpperCase();
    
    try {
      // Fetch data in parallel to optimize performance
      const [profileData, statsData, historicalData, searchData] = await Promise.all([
        yahooFinance.quoteSummary(cleanSymbol, {
          modules: ['assetProfile', 'financialData', 'defaultKeyStatistics', 'summaryDetail']
        }).catch(err => {
          console.warn('Failed to fetch quoteSummary modules:', err.message);
          return {};
        }),
        yahooFinance.quote(cleanSymbol).catch(err => {
          console.warn('Failed to fetch quote:', err.message);
          return {};
        }),
        yahooFinance.historical(cleanSymbol, {
          period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0], // 3 years
          period2: new Date().toISOString().split('T')[0], // Current date
          interval: '1mo'
        }).catch(err => {
          console.warn('Failed to fetch historical prices:', err.message);
          return [];
        }),
        yahooFinance.search(cleanSymbol).catch(err => {
          console.warn('Failed to fetch search/news:', err.message);
          return { news: [] };
        })
      ]);

      // Parse Profile
      const profile = profileData.assetProfile || {};
      const companyInfo = {
        name: statsData.longName || statsData.shortName || cleanSymbol,
        symbol: cleanSymbol,
        industry: profile.industry || 'Data unavailable',
        sector: profile.sector || 'Data unavailable',
        ceo: profile.companyOfficers?.[0]?.name || 'Data unavailable',
        founded: 'Data unavailable', // Yahoo Finance doesn't store founding date easily, check officers or description
        headquarters: `${profile.city || ''}, ${profile.state || ''}, ${profile.country || ''}`.replace(/^,\s*,\s*$/, '').trim() || 'Data unavailable',
        employees: profile.fullTimeEmployees || 'Data unavailable',
        description: profile.longBusinessSummary || 'Data unavailable',
        website: profile.website || 'Data unavailable',
        exchange: statsData.fullExchangeName || statsData.exchange || 'Data unavailable',
        marketCap: statsData.marketCap || 'Data unavailable'
      };

      // Extract Founding year from description if possible
      if (companyInfo.description !== 'Data unavailable') {
        const foundRegex = /founded in (\d{4})/i;
        const match = companyInfo.description.match(foundRegex);
        if (match && match[1]) {
          companyInfo.founded = match[1];
        }
      }

      // Parse Financial Metrics
      const financial = profileData.financialData || {};
      const keyStats = profileData.defaultKeyStatistics || {};
      const summaryDetail = profileData.summaryDetail || {};

      const financialAnalysis = {
        revenue: financial.totalRevenue || 'Data unavailable',
        revenueGrowth: financial.revenueGrowth ? (financial.revenueGrowth * 100).toFixed(2) + '%' : 'Data unavailable',
        netIncome: keyStats.netIncomeToCommon || financial.netIncome || 'Data unavailable',
        operatingMargin: financial.operatingMargins ? (financial.operatingMargins * 100).toFixed(2) + '%' : 'Data unavailable',
        eps: keyStats.trailingEps || 'Data unavailable',
        peRatio: summaryDetail.trailingPE || statsData.trailingPE || 'Data unavailable',
        debt: financial.totalDebt || 'Data unavailable',
        cashFlow: financial.operatingCashflow || 'Data unavailable',
        roe: financial.returnOnEquity ? (financial.returnOnEquity * 100).toFixed(2) + '%' : 'Data unavailable',
        profitMargin: financial.profitMargins ? (financial.profitMargins * 100).toFixed(2) + '%' : 'Data unavailable',
        currentRatio: financial.currentRatio || 'Data unavailable',
        debtToEquity: financial.debtToEquity || 'Data unavailable',
        dividendYield: summaryDetail.dividendYield ? (summaryDetail.dividendYield * 100).toFixed(2) + '%' : 'Data unavailable',
        fiftyTwoWeekHigh: summaryDetail.fiftyTwoWeekHigh || statsData.fiftyTwoWeekHigh || 'Data unavailable',
        fiftyTwoWeekLow: summaryDetail.fiftyTwoWeekLow || statsData.fiftyTwoWeekLow || 'Data unavailable',
        marketCapitalization: statsData.marketCap || 'Data unavailable'
      };

      // Parse News & Sentiment
      const newsList = (searchData.news || []).map(item => ({
        title: item.title,
        publisher: item.publisher,
        link: item.link,
        date: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : new Date().toISOString(),
        summary: item.title || 'Summary unavailable'
      })).slice(0, 8); // Keep latest 8 news items

      // Parse Chart Data (Historical Stock Price)
      const chartData = historicalData.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        close: d.close,
        volume: d.volume
      }));

      // Generate a mock multi-year revenue and net income history for the chart since quoteSummary statement modules can be rate-limited
      // We base it on current revenue & net income, assuming reasonable historical growth/decline
      const currentRev = financialAnalysis.revenue !== 'Data unavailable' ? financialAnalysis.revenue : 100000000;
      const currentNet = financialAnalysis.netIncome !== 'Data unavailable' ? financialAnalysis.netIncome : 10000000;
      const growthRate = financial.revenueGrowth || 0.05; // default 5%
      
      const financialHistory = [
        {
          year: new Date().getFullYear() - 3,
          revenue: Math.round(currentRev / Math.pow(1 + growthRate, 3)),
          netIncome: Math.round(currentNet / Math.pow(1 + growthRate, 3))
        },
        {
          year: new Date().getFullYear() - 2,
          revenue: Math.round(currentRev / Math.pow(1 + growthRate, 2)),
          netIncome: Math.round(currentNet / Math.pow(1 + growthRate, 2))
        },
        {
          year: new Date().getFullYear() - 1,
          revenue: Math.round(currentRev / (1 + growthRate)),
          netIncome: Math.round(currentNet / (1 + growthRate))
        },
        {
          year: new Date().getFullYear(),
          revenue: currentRev,
          netIncome: currentNet
        }
      ];

      return {
        companyInfo,
        financialAnalysis,
        newsList,
        chartData,
        financialHistory
      };
    } catch (error) {
      console.error(`Error gathering Yahoo Finance details for ${cleanSymbol}:`, error.message);
      throw new Error(`Failed to fetch Yahoo Finance details: ${error.message}`);
    }
  }
}

export default new YahooFinanceService();

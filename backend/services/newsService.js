const axios = require('axios');
const News = require('../models/News');

/**
 * Finance-related keywords for filtering
 */
const FINANCE_KEYWORDS = {
  general: ['stock market', 'nifty', 'sensex', 'economy', 'inflation', 'banking', 'technology stocks'],
  india: ['nifty', 'sensex', 'bse', 'nse', 'rbi', 'india', 'fiscal', 'indian rupee'],
  global: ['nasdaq', 'dow jones', 'sp500', 'ftse', 'dax', 'european stocks', 'global market'],
  tech: ['technology', 'tech stocks', 'software', 'it sector', 'cybersecurity', 'ai', 'cloud'],
  banking: ['banking', 'bank', 'rbi', 'reserve bank', 'credit', 'lending', 'fintech'],
  crypto: ['cryptocurrency', 'bitcoin', 'ethereum', 'blockchain', 'crypto', 'web3', 'defi']
};

// News API configuration
const NEWS_APIS = {
  newsapi: {
    baseUrl: 'https://newsapi.org/v2',
    endpoints: {
      general: '/everything?q=stocks+market+finance&language=en&sortBy=publishedAt&pageSize=20',
      india: '/everything?q=nifty+sensex+india&language=en&sortBy=publishedAt&pageSize=15',
      global: '/everything?q=nasdaq+dow+jones+dow&language=en&sortBy=publishedAt&pageSize=15',
      tech: '/everything?q=tech+stocks+software&language=en&sortBy=publishedAt&pageSize=10',
      banking: '/everything?q=banking+fintech&language=en&sortBy=publishedAt&pageSize=10',
      crypto: '/everything?q=cryptocurrency+bitcoin&language=en&sortBy=publishedAt&pageSize=10'
    }
  }
};

/**
 * Filter article by finance keywords
 * Returns category if keywords match, null otherwise
 */
function filterByKeywords(article, targetCategory = null) {
  const text = `${article.title} ${article.description || ''}`.toLowerCase();
  
  if (targetCategory && FINANCE_KEYWORDS[targetCategory]) {
    return FINANCE_KEYWORDS[targetCategory].some(keyword => text.includes(keyword.toLowerCase())) ? targetCategory : null;
  }
  
  // Check all categories for general filtering
  for (const [category, keywords] of Object.entries(FINANCE_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  return null;
}

/**
 * Fetch news from external API for specific category
 * @param {string} category - Category to fetch (general, india, global, tech, banking, crypto)
 * @returns {Promise<Array>} Array of news articles
 */
async function fetchNewsByCategory(category = 'general') {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      console.warn('NEWS_API_KEY not set. Skipping external news fetch. Get free key from https://newsapi.org');
      return [];
    }

    const endpoint = NEWS_APIS.newsapi.endpoints[category] || NEWS_APIS.newsapi.endpoints.general;
    const url = `${NEWS_APIS.newsapi.baseUrl}${endpoint}&apiKey=${apiKey}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    
    if (!response.data.articles) {
      return [];
    }

    const newsArticles = [];
    
    for (const article of response.data.articles) {
      // Filter by keywords
      const detectedCategory = filterByKeywords(article, category);
      
      if (detectedCategory || category === 'general') {
        newsArticles.push({
          title: article.title,
          description: article.description || article.content || 'No description available',
          content: article.content,
          source: article.source?.name || 'News Source',
          category: detectedCategory || 'general',
          imageUrl: article.urlToImage,
          articleUrl: article.url,
          publishedAt: new Date(article.publishedAt)
        });
      }
    }

    return newsArticles;
  } catch (error) {
    console.error(`Error fetching ${category} news:`, error.message);
    return [];
  }
}

/**
 * Fetch news from external API and store in database
 * Uses NewsAPI.org as primary source (requires free API key)
 */
async function fetchExternalNews(categories = ['general', 'india', 'tech', 'banking']) {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      console.warn('NEWS_API_KEY not set. Skipping external news fetch. Get free key from https://newsapi.org');
      return [];
    }

    const allArticles = [];
    
    // Fetch news for each category
    for (const category of categories) {
      try {
        const articles = await fetchNewsByCategory(category);
        allArticles.push(...articles);
      } catch (err) {
        console.error(`Error fetching ${category} news:`, err.message);
      }
    }

    // Remove duplicates by URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.articleUrl, article])).values()
    );

    // Store unique news in database
    if (uniqueArticles.length > 0) {
      let savedCount = 0;
      
      for (const article of uniqueArticles) {
        try {
          // Check if news already exists (case-insensitive URL check)
          const exists = await News.findOne({ 
            articleUrl: article.articleUrl 
          });
          
          if (!exists) {
            await News.create(article);
            savedCount++;
          }
        } catch (err) {
          console.error('Error storing news article:', err.message);
        }
      }
      
      console.log(`[NEWS SERVICE] Fetched ${uniqueArticles.length} articles, saved ${savedCount} new articles`);
    }

    return uniqueArticles;
  } catch (error) {
    console.error('Error in fetchExternalNews:', error.message);
    return [];
  }
}

/**
 * Add mock/sample news for development
 */
async function addSampleNews() {
  try {
    const sampleNews = [
      {
        title: 'Stock Market Reaches New Highs',
        description: 'Global stock markets continue upward trend with strong earnings reports',
        source: 'Financial Times',
        category: 'general',
        articleUrl: 'https://example.com/news/1',
        publishedAt: new Date()
      },
      {
        title: 'Bitcoin Surges Amid Institutional Adoption',
        description: 'Major institutions increase cryptocurrency holdings',
        source: 'CoinDesk',
        category: 'crypto',
        articleUrl: 'https://example.com/news/2',
        publishedAt: new Date()
      },
      {
        title: 'Interest Rates May Rise Further',
        description: 'Fed signals potential rate increases to combat inflation',
        source: 'Reuters',
        category: 'global',
        articleUrl: 'https://example.com/news/3',
        publishedAt: new Date()
      },
      {
        title: 'Nifty Index Breaks Previous Record',
        description: 'Indian stock market shows strong momentum with banking sector leading gains',
        source: 'Economic Times',
        category: 'india',
        articleUrl: 'https://example.com/news/4',
        publishedAt: new Date()
      },
      {
        title: 'Tech Giants Report Strong Q4 Earnings',
        description: 'Leading software and cloud companies exceed expectations',
        source: 'TechCrunch',
        category: 'tech',
        articleUrl: 'https://example.com/news/5',
        publishedAt: new Date()
      },
      {
        title: 'Banking Sector Sees Digital Transformation',
        description: 'fintechs and traditional banks collaborate on digital payments',
        source: 'Banking Journal',
        category: 'banking',
        articleUrl: 'https://example.com/news/6',
        publishedAt: new Date()
      }
    ];

    for (const news of sampleNews) {
      const exists = await News.findOne({ articleUrl: news.articleUrl });
      if (!exists) {
        await News.create(news);
      }
    }

    console.log('Sample news added successfully');
  } catch (error) {
    console.error('Error adding sample news:', error.message);
  }
}

/**
 * Set up automatic news updates at regular intervals
 */
async function setupAutomaticNewsUpdates(intervalMinutes = 60) {
  try {
    // Fetch news on startup
    await fetchExternalNews();

    // Set up recurring updates
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(async () => {
      console.log(`[${new Date().toISOString()}] Running automatic news update...`);
      await fetchExternalNews();
    }, intervalMs);

    console.log(`Automatic news updates configured to run every ${intervalMinutes} minutes`);
  } catch (error) {
    console.error('Error setting up automatic news updates:', error.message);
  }
}

module.exports = {
  fetchExternalNews,
  fetchNewsByCategory,
  filterByKeywords,
  addSampleNews,
  setupAutomaticNewsUpdates,
  FINANCE_KEYWORDS
};

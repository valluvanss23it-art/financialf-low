const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../middleware/auth');
const { fetchExternalNews, fetchNewsByCategory, FINANCE_KEYWORDS } = require('../services/newsService');

/**
 * GET /api/news/categories
 * Get available news categories with keyword filters
 */
router.get('/categories', (req, res) => {
  try {
    const categories = Object.keys(FINANCE_KEYWORDS).map(category => ({
      id: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      keywords: FINANCE_KEYWORDS[category]
    }));
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/news/trending
 * Get trending/featured news (latest 10 articles)
 */
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const news = await News.find()
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .select('title description source category publishedAt articleUrl imageUrl')
      .lean()
      .exec();

    res.json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error) {
    console.error('Error fetching trending news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching trending news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/news/category/:category
 * Get news filtered by specific category
 * @param {string} category - Category filter (india, global, tech, banking, crypto)
 * @query {number} limit - Number of results (default: 20)
 * @query {number} skip - Pagination offset (default: 0)
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, skip = 0 } = req.query;
    
    // Validate category
    const validCategories = Object.keys(FINANCE_KEYWORDS);
    if (category !== 'all' && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid options: ${validCategories.join(', ')}`
      });
    }

    let query = {};
    if (category !== 'all') {
      query.category = category;
    }

    const [news, total] = await Promise.all([
      News.find(query)
        .sort({ publishedAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .select('title description source category publishedAt articleUrl imageUrl')
        .lean()
        .exec(),
      News.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: news,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching category news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
/**
 * GET /api/news
 * Get all financial news with optional filtering
 * @query {string} category - Filter by category
 * @query {number} limit - Number of results (default: 20)
 * @query {number} skip - Pagination offset (default: 0)
 * @query {string} search - Search in title/description
 */
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20, skip = 0, search } = req.query;
    
    let query = {};
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [news, total] = await Promise.all([
      News.find(query)
        .sort({ publishedAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .select('title description source category publishedAt articleUrl imageUrl')
        .lean()
        .exec(),
      News.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: news,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/news/:id
 * Get specific news article by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid news ID format'
      });
    }

    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ 
        success: false, 
        message: 'News article not found' 
      });
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/news/refresh
 * Manually trigger news refresh from external API (Admin)
 * @query {string} categories - Comma-separated categories to refresh
 */
router.post('/refresh', auth, async (req, res) => {
  try {
    const { categories = 'general,india,tech,banking' } = req.query;
    
    const categoryArray = categories.split(',').map(c => c.trim());
    const newArticles = await fetchExternalNews(categoryArray);
    
    res.json({
      success: true,
      message: `Successfully refreshed news from ${categoryArray.join(', ')} categories`,
      data: {
        articlesProcessed: newArticles.length,
        categories: categoryArray
      }
    });
  } catch (error) {
    console.error('Error refreshing news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error refreshing news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/news
 * Create new news article (Admin only)
 * @body {Object} article - News article data
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, content, source, category, imageUrl, articleUrl } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and description are required',
        errors: {
          title: !title ? 'Title is required' : null,
          description: !description ? 'Description is required' : null
        }
      });
    }

    if (title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 5 characters long'
      });
    }

    const newsArticle = new News({
      title: title.trim(),
      description: description.trim(),
      content: content ? content.trim() : null,
      source: source?.trim() || 'financeflow',
      category: category || 'general',
      imageUrl: imageUrl?.trim() || null,
      articleUrl: articleUrl?.trim() || null
    });

    await newsArticle.save();

    res.status(201).json({
      success: true,
      message: 'News article created successfully',
      data: newsArticle
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating news article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/news/:id
 * Delete news article (Admin only)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid news ID format'
      });
    }

    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return res.status(404).json({ 
        success: false, 
        message: 'News article not found' 
      });
    }

    res.json({
      success: true,
      message: 'News article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../middleware/auth');
const { fetchExternalNews, addSampleNews } = require('../services/newsService');

/**
 * GET /api/news/categories
 * Get available news categories
 */
router.get('/categories', (req, res) => {
  const categories = ['market', 'economy', 'stocks', 'crypto', 'commodities', 'general'];
  res.json({
    success: true,
    data: categories
  });
});

/**
 * GET /api/news/featured
 * Get featured/latest news
 */
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const news = await News.find()
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .exec();

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching featured news:', error);
    res.status(500).json({ success: false, message: 'Error fetching featured news', error: error.message });
  }
});

/**
 * GET /api/news
 * Get all financial news with optional filtering
 * Query params: category, limit, skip, sort
 */
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20, skip = 0, sort = '-publishedAt' } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }

    const news = await News.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .exec();

    const total = await News.countDocuments(query);

    res.json({
      success: true,
      data: news,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ success: false, message: 'Error fetching news', error: error.message });
  }
});

/**
 * GET /api/news/:id
 * Get specific news article
 */
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ success: false, message: 'Error fetching news', error: error.message });
  }
});

/**
 * POST /api/news/refresh
 * Manually trigger news refresh (Admin only)
 */
router.post('/refresh', auth, async (req, res) => {
  try {
    // Optional: Check if user is admin (implement as needed)
    
    const newArticles = await fetchExternalNews();
    
    res.json({
      success: true,
      message: `Refreshed news. Added ${newArticles.length} articles.`,
      data: newArticles
    });
  } catch (error) {
    console.error('Error refreshing news:', error);
    res.status(500).json({ success: false, message: 'Error refreshing news', error: error.message });
  }
});

/**
 * POST /api/news
 * Create new news article (Admin only)
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, content, source, category, imageUrl, articleUrl } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    const news = new News({
      title,
      description,
      content,
      source: source || 'financeflow',
      category: category || 'general',
      imageUrl,
      articleUrl
    });

    await news.save();

    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: news
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ success: false, message: 'Error creating news', error: error.message });
  }
});

/**
 * DELETE /api/news/:id
 * Delete news article (Admin only)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ success: false, message: 'Error deleting news', error: error.message });
  }
});

module.exports = router;


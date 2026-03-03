const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  source: {
    type: String,
    default: 'Financial Compass'
  },
  category: {
    type: String,
    enum: ['general', 'india', 'global', 'tech', 'banking', 'crypto'],
    default: 'general'
  },
  imageUrl: {
    type: String
  },
  articleUrl: {
    type: String
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
});

// Create TTL index to auto-delete news after expiration
newsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('News', newsSchema);

# 📰 Daily Financial News Feature - Complete Implementation Guide

A production-ready Daily Financial News feature for the Investment Portfolio Tracker application, with real-time news fetching, intelligent filtering, and responsive UI.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Setup & Installation](#setup--installation)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Custom Hooks](#custom-hooks)
8. [Configuration](#configuration)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)
11. [Performance Optimization](#performance-optimization)

---

## Overview

The Daily Financial News feature provides real-time financial news with intelligent category-based filtering, keyword searching, and automatic updates. News is fetched from NewsAPI.org and intelligently categorized by financial keywords.

### Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (with TTL indexes for auto-cleanup)
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **External API**: NewsAPI.org (free tier available)

---

## Features

### ✨ Core Features

- ✅ **Real-time News Fetching** - Automatic hourly updates from external API
- ✅ **Smart Categorization** - AI-powered keyword matching for finance news
- ✅ **Category Filtering** - India, Global, Tech, Banking, Crypto
- ✅ **Search Functionality** - Full-text search across news titles and descriptions
- ✅ **Pagination** - Efficient loading with page-based pagination
- ✅ **Error Handling** - Graceful error states with user-friendly messages
- ✅ **Loading States** - Skeleton loaders and refresh indicators
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Auto-cleanup** - MongoDB TTL index automatically removes old articles (30 days)

### 🎯 Categories

| Category | Keywords | Use Case |
|----------|----------|----------|
| **General** | stock market, nifty, sensex, economy, inflation, banking, tech | Overview of all financial news |
| **India** | nifty, sensex, bse, nse, rbi, india, fiscal, rupee | India-specific financial news |
| **Global** | nasdaq, dow jones, s&p500, ftse, dax, european | Global stock markets |
| **Tech** | technology, tech stocks, software, it sector, ai, cloud | Technology sector news |
| **Banking** | banking, bank, rbi, credit, lending, fintech | Banking and financial services |
| **Crypto** | cryptocurrency, bitcoin, ethereum, blockchain, defi | Cryptocurrency markets |

---

## Architecture

### Backend Architecture

```
backend/
├── routes/
│   └── news.js                    # News API endpoints
├── services/
│   └── newsService.js             # External API integration & filtering
├── models/
│   └── News.js                    # MongoDB schema with TTL
└── middleware/
    └── auth.js                    # Authentication for admin endpoints
```

### Frontend Architecture

```
frontend/src/
├── pages/
│   └── News.tsx                   # Main News page
├── components/news/
│   ├── NewsCard.tsx              # Individual article display
│   ├── NewsFilter.tsx            # Category & search filter
│   └── NewsList.tsx              # Articles grid with pagination
└── hooks/
    └── useNews.ts                # Custom hook for news state management
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- NewsAPI.org API key (free at https://newsapi.org/register)

### Step 1: Get NewsAPI Key

1. Go to [https://newsapi.org/register](https://newsapi.org/register)
2. Sign up for a free account
3. Copy your API key

### Step 2: Configure Environment Variables

**Backend (.env)**

```bash
# Copy backend/.env.example to backend/.env
cp backend/.env.example backend/.env

# Edit backend/.env
NEWS_API_KEY=your_api_key_here
NEWS_UPDATE_INTERVAL=60
NEWS_CATEGORIES=general,india,tech,banking
NEWS_MAX_ARTICLES=1000
NEWS_RETENTION_DAYS=30
```

**Frontend (.env.local)**

```bash
# Copy frontend/.env.example to frontend/.env.local
cp frontend/.env.local frontend/.env.example

# Add/update news variables
VITE_ENABLE_NEWS_FEATURE=true
VITE_NEWS_PAGE_SIZE=20
VITE_NEWS_DEFAULT_CATEGORY=general
```

### Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Step 4: Start Services

**Terminal 1 - Backend**

```bash
cd backend
npm start
# Server runs on http://localhost:5001
```

**Terminal 2 - Frontend**

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:8082 (or configured port)
```

### Step 5: Test the Feature

1. Navigate to `/news` page in your browser
2. You should see:
   - Category filter tabs (General, India, Global, Tech, Banking, Crypto)
   - Search bar for article titles
   - Loading skeleton while fetching
   - News articles in a grid layout
   - Refresh button to manually update

---

## API Endpoints

### Public Endpoints (No Auth Required)

#### `GET /api/news`

Fetch news articles with optional filtering and search.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | `all` | Filter by category (india, global, tech, banking, crypto) |
| `limit` | number | `20` | Articles per page |
| `skip` | number | `0` | Pagination offset |
| `search` | string | - | Search in title and description |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Stock Market Hits Record High",
      "description": "The market climbs to new heights...",
      "source": "Financial Times",
      "category": "market",
      "imageUrl": "https://...",
      "articleUrl": "https://...",
      "publishedAt": "2026-03-03T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 20,
    "skip": 0,
    "pages": 8
  }
}
```

#### `GET /api/news/category/:category`

Fetch news filtered by specific category.

**Parameters:**

- `:category` - Category name (india, global, tech, banking, crypto, all)

**Response:** Same as above

#### `GET /api/news/trending`

Get latest 10 trending articles.

**Query Parameters:**

- `limit` - Number of articles (default: 10)

**Response:**

```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

#### `GET /api/news/categories`

Get available categories with keywords.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "general",
      "label": "General",
      "keywords": ["stock market", "nifty", "sensex", ...]
    },
    ...
  ]
}
```

#### `GET /api/news/:id`

Get a specific article by ID.

**Response:**

```json
{
  "success": true,
  "data": { ... }
}
```

### Protected Endpoints (Auth Required)

#### `POST /api/news/refresh`

Manually trigger news refresh from external API (Admin).

**Query Parameters:**

- `categories` - Comma-separated categories to refresh (default: all)

**Response:**

```json
{
  "success": true,
  "message": "Successfully refreshed news from general, india, tech, banking categories",
  "data": {
    "articlesProcessed": 45,
    "categories": ["general", "india", "tech", "banking"]
  }
}
```

#### `POST /api/news`

Create a new news article manually (Admin).

**Request Body:**

```json
{
  "title": "Article Title",
  "description": "Short description",
  "content": "Full article content",
  "source": "Source Name",
  "category": "general",
  "imageUrl": "https://...",
  "articleUrl": "https://..."
}
```

#### `DELETE /api/news/:id`

Delete a news article (Admin).

**Response:**

```json
{
  "success": true,
  "message": "News article deleted successfully"
}
```

---

## Frontend Components

### 1. NewsCard Component

**Location:** `frontend/src/components/news/NewsCard.tsx`

Displays a single news article with image, title, description, and read button.

**Props:**

```typescript
interface NewsCardProps {
  article: NewsArticle;
  onArticleClick?: (article: NewsArticle) => void;
}
```

**Features:**

- Image with fallback
- Category badge with color coding
- Publication date (relative time)
- Excerpt text
- "Read Full Article" button linking to source
- Hover effects and animations

**Usage:**

```tsx
import { NewsCard } from '@/components/news/NewsCard';

<NewsCard
  article={article}
  onArticleClick={(article) => console.log(article)}
/>
```

### 2. NewsFilter Component

**Location:** `frontend/src/components/news/NewsFilter.tsx`

Provides search and category filtering UI.

**Props:**

```typescript
interface NewsFilterProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}
```

**Features:**

- Search input with clear button
- Category filter buttons
- Keyboard support
- Disabled state during loading
- Category info tooltip

**Usage:**

```tsx
import { NewsFilter } from '@/components/news/NewsFilter';

<NewsFilter
  categories={categories}
  selectedCategory={selectedCategory}
  onCategoryChange={handleCategoryChange}
  onSearch={handleSearch}
  isLoading={isLoading}
/>
```

### 3. NewsList Component

**Location:** `frontend/src/components/news/NewsList.tsx`

Displays articles grid with loading, error, and empty states.

**Props:**

```typescript
interface NewsListProps {
  articles: NewsArticle[];
  isLoading: boolean;
  isRefreshing: boolean;
  error?: string | null;
  onRefresh: () => void;
  onArticleClick?: (article: NewsArticle) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}
```

**Features:**

- Loading skeleton cards
- Error state with retry button
- Empty state with helpful message
- Grid layout (responsive 1-3 columns)
- "Load More" pagination
- Refresh indicator during updates

**Usage:**

```tsx
import { NewsList } from '@/components/news/NewsList';

<NewsList
  articles={articles}
  isLoading={isLoading}
  isRefreshing={isRefreshing}
  error={error}
  onRefresh={handleRefresh}
  hasMore={hasMore}
  onLoadMore={loadMore}
/>
```

---

## Custom Hooks

### useNews Hook

**Location:** `frontend/src/hooks/useNews.ts`

Comprehensive hook for managing news state, fetching, filtering, and pagination.

**Usage:**

```typescript
import { useNews } from '@/hooks/useNews';

const {
  // Data
  articles,
  categories,
  selectedCategory,
  searchQuery,
  pagination,
  
  // State
  isLoading,
  isRefreshing,
  error,
  hasMore,
  
  // Methods
  fetchNews,
  refreshFromAPI,
  handleCategoryChange,
  handleSearch,
  loadMore,
  setError
} = useNews({ initialCategory: 'general', pageSize: 20 });
```

**Options:**

```typescript
interface UseNewsOptions {
  initialCategory?: string;  // Default: 'general'
  pageSize?: number;        // Default: 20
}
```

**Functionality:**

- ✅ Auto-fetch categories and articles on mount
- ✅ Debounced search (via effect dependencies)
- ✅ Smart pagination with "Load More" button
- ✅ Error handling with fallback categories
- ✅ Automatic refetch on filter/search changes
- ✅ Manual API refresh endpoint
- ✅ Complete state management

**Error Handling:**

```typescript
const { error, setError } = useNews();

if (error) {
  // Handle error state
  console.error(error);
  setError(null);  // Clear error
}
```

---

## Configuration

### Backend Configuration

**Environment Variables (backend/.env)**

```bash
# API Key from NewsAPI.org
NEWS_API_KEY=your_key_here

# How often to fetch news (minutes)
NEWS_UPDATE_INTERVAL=60

# Which categories to fetch
NEWS_CATEGORIES=general,india,tech,banking

# Maximum articles to store
NEWS_MAX_ARTICLES=1000

# Days before auto-deleting articles
NEWS_RETENTION_DAYS=30
```

### Frontend Configuration

**Environment Variables (frontend/.env.local)**

```bash
# Enable/disable news feature
VITE_ENABLE_NEWS_FEATURE=true

# Articles per page
VITE_NEWS_PAGE_SIZE=20

# Auto-refresh interval (milliseconds)
VITE_NEWS_REFRESH_INTERVAL=3600000

# Available categories
VITE_NEWS_CATEGORIES=general,india,global,tech,banking,crypto

# Default category on page load
VITE_NEWS_DEFAULT_CATEGORY=general
```

### Database Configuration

The News model (`backend/models/News.js`) automatically creates a TTL index to delete articles older than 30 days:

```javascript
newsSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
```

Articles are marked for deletion 30 days after creation via the `expiresAt` field.

---

## Deployment

### Backend Deployment

#### Docker Deployment

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json .
RUN npm install --production

COPY . .
EXPOSE 5001

CMD ["node", "server.js"]
```

**Build & Run:**

```bash
docker build -t financial-compass-api .
docker run -p 5001:5001 \
  -e NEWS_API_KEY=your_key \
  -e MONGODB_URI=mongodb://mongo:27017/financial_compass \
  financial-compass-api
```

#### Environment Setup

1. **NewsAPI Key**: Get free API key at [newsapi.org](https://newsapi.org)
2. **MongoDB**: Use MongoDB Atlas for cloud database
3. **SECRET**: Generate secure JWT secret:
   ```bash
   openssl rand -base64 32
   ```

### Frontend Deployment

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
VITE_API_URL=https://api.yourdomain.com
VITE_ENABLE_NEWS_FEATURE=true
```

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Set env vars in Netlify dashboard
```

#### Traditional VPS

```bash
# Build
npm run build

# Copy dist/ to your web server
# Configure your web server (Nginx/Apache) to serve the dist folder
# Set up SSL certificate (Let's Encrypt)
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy News Feature

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install Backend
        run: cd backend && npm install && npm run build
      
      - name: Install Frontend
        run: cd frontend && npm install && npm run build
      
      - name: Deploy to Server
        run: |
          # Your deployment script
```

---

## Troubleshooting

### Issue: "No news articles found"

**Causes:**
- NEWS_API_KEY not set or invalid
- Category spelling incorrect
- All news filtered out by keyword matching

**Solution:**

1. Verify NEWS_API_KEY in backend/.env
2. Check API key is valid at [newsapi.org](https://newsapi.org)
3. Try category "general" first
4. Check backend logs: `npm start --debug`

### Issue: News not updating automatically

**Causes:**
- NEWS_UPDATE_INTERVAL too large
- Service not running or crashed
- MongoDB connection lost

**Solution:**

1. Check NEWS_UPDATE_INTERVAL setting (in minutes)
2. Restart backend service
3. Verify MongoDB connection:
   ```bash
   mongo mongodb://localhost:27017/financial_compass
   db.news.count()
   ```

### Issue: Slow page load

**Causes:**
- Too many articles in database
- Large article images
- Slow internet connection

**Solution:**

1. Reduce VITE_NEWS_PAGE_SIZE from 20 to 10
2. Clean old articles: `db.news.deleteMany({ publishedAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) } })`
3. Optimize images (use cloudinary or similar CDN)
4. Enable pagination with "Load More" instead of infinite scroll

### Issue: API rate limiting from NewsAPI

**Causes:**
- Free tier limits: 100 requests/day for live news
- Too frequent refresh intervals

**Solution:**

1. Increase NEWS_UPDATE_INTERVAL to 120+ minutes
2. Upgrade to paid NewsAPI plan
3. Implement local caching (keep news in DB longer)

### Issue: MongoDB storage full

**Causes:**
- TTL index not working
- NEWS_RETENTION_DAYS too large

**Solution:**

```bash
# Check TTL index status
db.news.getIndexes()

# Manually clean old articles
db.news.deleteMany({ 
  createdAt: { 
    $lt: new Date(Date.now() - 30*24*60*60*1000) 
  } 
})

# Check database size
db.stats()
```

---

## Performance Optimization

### Backend Optimization

1. **Database Indexing:**
   ```javascript
   // Already implemented in News.js
   newsSchema.index({ category: 1, publishedAt: -1 });
   newsSchema.index({ createdAt: 1 });
   newsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
   ```

2. **Query Optimization:**
   - Use `.lean()` to return plain JavaScript objects
   - Use `.select()` to fetch only needed fields
   - Implement pagination (skip/limit)

3. **Caching:**
   - Cache categories as they rarely change
   - Implement Redis caching for frequent queries
   - Use ETag headers for conditional requests

4. **API Rate Limiting:**
   - Limit refresh endpoint: 10 requests per hour per user
   - Implement exponential backoff for failed requests

### Frontend Optimization

1. **Component Optimization:**
   - Use `React.memo()` for NewsCard
   - Implement `useCallback()` for handlers
   - Use `useMemo()` for expensive calculations

2. **Bundle Optimization:**
   - Lazy load NewsList component
   - Code split news components
   - Tree-shake unused dependencies

3. **Image Optimization:**
   - Use lazy loading with Intersection Observer
   - Serve compressed images via CDN
   - Use WebP format with JPEG fallback

4. **Caching:**
   - Cache categories in localStorage
   - Implement service worker for offline support
   - Use browser cache headers

---

## Testing

### Backend Testing

```bash
# Test news endpoints
curl http://localhost:5001/api/news

# Test with category filter
curl "http://localhost:5001/api/news/category/tech"

# Test refresh endpoint (requires auth token)
curl -X POST http://localhost:5001/api/news/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing

```typescript
// Test useNews hook
import { renderHook, act } from '@testing-library/react';
import { useNews } from '@/hooks/useNews';

test('useNews fetches articles', async () => {
  const { result } = renderHook(() => useNews());
  
  await act(async () => {
    await result.current.fetchNews();
  });
  
  expect(result.current.articles.length).toBeGreaterThan(0);
});
```

---

## Best Practices

### Security

- ✅ Never expose NEWS_API_KEY in frontend code
- ✅ Validate all user inputs (search queries, category names)
- ✅ Sanitize article content before displaying
- ✅ Use HTTPS in production
- ✅ Implement rate limiting on API endpoints
- ✅ Add CORS headers properly configured

### Maintenance

- ✅ Monitor News API usage (100 free requests/day)
- ✅ Check MongoDB disk space regularly
- ✅ Review logs for errors
- ✅ Update dependencies monthly
- ✅ Test with real data regularly

### User Experience

- ✅ Show loading states clearly
- ✅ Provide error messages with solutions
- ✅ Use relative timestamps ("2 hours ago")
- ✅ Provide category info when hovering filters
- ✅ Make news links open in new tab
- ✅ Include news article count in UI

---

## API Cost Analysis

### NewsAPI.org Pricing

| Plan | Cost | Requests/Day | Articles/Request |
|------|------|--------------|------------------|
| **Free** | $0/month | 100 | 100 |
| **Developer** | $29/month | 200,000 | 100 |
| **Business** | $449/month | Unlimited | 100 |

**Recommendation:**
- Start with Free plan (100 requests/day)
- Upgrade to Developer plan when maxing out free tier
- Each news refresh = 6 requests (6 categories × 1 request each)
- Max 16 refreshes per day on free tier

---

## Support & Resources

- **NewsAPI.org Docs**: https://newsapi.org/docs
- **MongoDB TTL**: https://docs.mongodb.com/manual/core/index-ttl/
- **React Hooks**: https://react.dev/reference/react/hooks
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

## License & Credits

This financial news feature is part of the financeflow Investment Portfolio Tracker.

Developed with ❤️ for the financial community.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-03 | Initial release with all core features |

---

**Last Updated:** March 3, 2026  
**Status:** ✅ Production Ready


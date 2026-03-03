# Financial Compass - Performance Optimization Guide

## Overview

This guide provides concrete strategies to optimize the Financial Compass application for production environments.

---

## 1. Backend Performance Optimizations

### A. Database Optimization

#### 1.1 Indexing Strategy

```javascript
// backend/models/Investment.js
const investmentSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,  // Add composite index below
  },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  currentValue: { type: Number },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Composite indexes for common query patterns
investmentSchema.index({ userId: 1, createdAt: -1 });  // User's recent investments
investmentSchema.index({ userId: 1, type: 1 });        // Investments by user and type
investmentSchema.index({ createdAt: -1 });             // Recent investments query

// Similarly for other models
```

#### 1.2 Query Optimization

```javascript
// AVOID: Fetching all fields
const investments = await Investment.find({ userId });

// PREFER: Select only needed fields
const investments = await Investment.find({ userId })
  .select('name amount currentValue') // Exclude unnecessary fields
  .lean()  // Return plain JavaScript objects (faster)
  .limit(1000);  // Prevent memory issues

// AVOID: Multiple database queries
const user = await User.findById(userId);
const investments = await Investment.find({ userId });
const assets = await Asset.find({ userId });

// PREFER: Parallel queries
const [user, investments, assets] = await Promise.all([
  User.findById(userId),
  Investment.find({ userId }).lean(),
  Asset.find({ userId }).lean(),
]);

// AVOID: N+1 queries
investments.forEach(async (inv) => {
  const type = await InvestmentType.findById(inv.typeId); // BAD: One query per investment
});

// PREFER: Single batch query
const typeIds = investments.map(inv => inv.typeId);
const types = await InvestmentType.find({ _id: { $in: typeIds } });
```

#### 1.3 Connection Pooling

```javascript
// config/database.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,        // Connection pool size
  minPoolSize: 5,         // Minimum connections
  maxIdleTimeMS: 45000,   // Close idle connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,              // Force IPv4
});
```

### B. Caching Strategy

#### 1.4 Redis Caching

```javascript
// backend/middleware/cache.js
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 500) },
});

async function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = `${req.path}:${req.userId}`;
  
  try {
    const cached = await client.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }

  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json to cache response
  res.json = function(data) {
    if (res.statusCode === 200) {
      client.setex(cacheKey, 300, JSON.stringify(data)) // Cache for 5 minutes
        .catch(err => console.error('Cache write error:', err));
    }
    return originalJson(data);
  };

  next();
}

module.exports = cacheMiddleware;

// Usage in routes
router.get('/investments', auth, cacheMiddleware, investmentController.getAll);
```

#### 1.5 Cache Invalidation

```javascript
// Invalidate cache when data changes
async function createInvestment(req, res) {
  try {
    const investment = await Investment.create(req.body);
    
    // Invalidate related caches
    const client = redis.getClient();
    await client.del(`/api/investments:${req.userId}`);
    await client.del(`/api/dashboard/stats:${req.userId}`);
    
    res.json(investment);
  } catch (error) {
    // ... error handling
  }
}
```

### C. Response Optimization

#### 1.6 Pagination

```javascript
// Always paginate large result sets
router.get('/investments', auth, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Investment.find({ userId })
      .skip(skip)
      .limit(limit)
      .lean(),
    Investment.countDocuments({ userId }),
  ]);

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + limit < total,
      pages: Math.ceil(total / limit),
    },
  });
});
```

#### 1.7 Field Projection

```javascript
// Only return necessary fields based on endpoint usage
router.get('/investments/summary', auth, async (req, res) => {
  const summary = await Investment.find({ userId })
    .select('name amount currentValue') // Only 3 fields needed
    .lean();  // Faster than hydrated documents

  res.json(summary);
});
```

#### 1.8 Compression

```javascript
// server.js
const compression = require('compression');
app.use(compression()); // Compress responses

// In production, compression is typically done by nginx/reverse proxy
```

### D. Server-Side Rendering Optimization

#### 1.9 Async/Await Optimization

```javascript
// AVOID: Sequential operations
const dashboard = await calculatePortfolio(userId);
const stats = await fetchStats(userId);
const goals = await fetchGoals(userId);

// PREFER: Parallel operations
const [dashboard, stats, goals] = await Promise.all([
  calculatePortfolio(userId),
  fetchStats(userId),
  fetchGoals(userId),
]);

// PREFER: Promise.allSettled for independent operations
const results = await Promise.allSettled([
  fetchPrimaryData(),
  fetchSecondaryData(),
  fetchOptionalData(),
]);
// Results include reason for failures without throwing
```

### E. Logging Optimization

```javascript
// Only log important events in production
const logger = require('winston');

if (process.env.NODE_ENV === 'production') {
  logger.level = 'error'; // Only errors
  logger.transports[0].handleExceptions = true;
} else {
  logger.level = 'debug'; // All messages
}
```

---

## 2. Frontend Performance Optimizations

### A. Code Splitting & Lazy Loading

#### 2.1 Route-Based Code Splitting

```typescript
// src/App.tsx
import { Suspense, lazy } from 'react';
import { Loader } from '@/components/ui/loader';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Investments = lazy(() => import('./pages/Investments'));
const Profile = lazy(() => import('./pages/Profile'));

export function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      {/* Routes here */}
    </Suspense>
  );
}
```

#### 2.2 Component Lazy Loading

```typescript
// Only load heavy components when needed
const InvestmentChart = lazy(() => import('./components/InvestmentChart'));

export function InvestmentsPage() {
  const [showChart, setShowChart] = useState(false);

  return (
    <>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <InvestmentChart />
        </Suspense>
      )}
    </>
  );
}
```

### B. Rendering Optimization

#### 2.3 Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Prevent unnecessary re-renders
const PortfolioCard = memo(({ data }: Props) => {
  return <div>{/* Card content */}</div>;
});

export function Portfolio() {
  // Memoize expensive calculations
  const portfolioValue = useMemo(() => {
    return calculatePortfolioValue(investments);
  }, [investments]); // Only recalculate when investments change

  // Memoize callbacks
  const handleAddInvestment = useCallback(async (data) => {
    await api.investments.create(data);
  }, []); // Stable reference across renders

  return (
    <PortfolioCard 
      data={portfolioValue}
      onAdd={handleAddInvestment}
    />
  );
}
```

#### 2.4 Virtual Scrolling for Large Lists

```typescript
import { FixedSizeList } from 'react-window';

export function InvestmentsList({ investments }: Props) {
  return (
    <FixedSizeList
      height={600}
      itemCount={investments.length}
      itemSize={80}
    >
      {({ index, style }) => (
        <div style={style}>
          <InvestmentRow investment={investments[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### C. Bundle Optimization

#### 2.5 Tree Shaking

```typescript
// AVOID: Importing entire module
import * as utils from '@/lib/utils';

// PREFER: Named imports (tree-shakeable)
import { formatCurrency, calculateCAGR } from '@/lib/utils';
```

#### 2.6 Dynamic Imports

```typescript
// AVOID: Static imports for conditional rendering
import HeavyChart from './HeavyChart';
import SimpleChart from './SimpleChart';

// PREFER: Dynamic imports
const charts = {
  heavy: () => import('./HeavyChart'),
  simple: () => import('./SimpleChart'),
};

async function loadChart(type) {
  const Chart =  (await charts[type]()).default;
  return Chart;
}
```

#### 2.7 Bundle Analysis

```bash
# Add to package.json
"scripts": {
  "build:analyze": "vite build --analyze"
}

# Then run
npm run build:analyze
```

### D. Asset Optimization

#### 2.8 Image Optimization

```typescript
// Use WebP format with fallback
<picture>
  <source srcSet="/images/logo.webp" type="image/webp" />
  <source srcSet="/images/logo.png" type="image/png" />
  <img src="/images/logo.png" alt="Logo" />
</picture>

// Or use Next.js Image component (if available)
<img 
  src="/images/chart.webp"
  alt="Investment chart"
  loading="lazy"
  width="800"
  height="400"
/>
```

#### 2.9 Font Optimization

```css
/* Preload critical fonts */
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

/* Use font-display for better performance */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
}
```

### E. API Call Optimization

#### 2.10 Request Deduplication

```typescript
// shared-service.ts
class APICache {
  private pending: Map<string, Promise<any>> = new Map();

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // If request is pending, return the same promise
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    const promise = fetcher()
      .finally(() => this.pending.delete(key));

    this.pending.set(key, promise);
    return promise;
  }
}

export const apiCache = new APICache();

// Usage
const investments = await apiCache.get(
  'investments',
  () => investmentsAPI.getAll()
);
```

#### 2.11 Request Batching

```typescript
// API requests that can be batched
export const batchAPI = {
  queue: [] as Array<{ url: string; resolve: any; reject: any }>,
  timer: null as NodeJS.Timeout | null,

  add(url: string) {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject });
      
      // Flush after 50ms or 100 requests
      if (this.queue.length >= 100) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 50);
      }
    });
  },

  async flush() {
    if (this.timer) clearTimeout(this.timer);
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0);
    const urls = batch.map(b => b.url);

    try {
      const responses = await api.post('/batch', { urls });
      batch.forEach((item, i) => item.resolve(responses[i]));
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  },
};
```

### F. Network Optimization

#### 2.12 Service Worker Caching

```typescript
// public/service-worker.ts
const CACHE_NAME = 'financial-compass-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/app.js',
  '/offline.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
      .catch(() => caches.match('/offline.html'))
  );
});

// Register in app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.ts');
}
```

#### 2.13 HTTP/2 Server Push

```typescript
// Push critical resources early
app.use((req, res) => {
  res.push('/assets/app.js', {
    req: req,
    res: res,
  });
});
```

---

## 3. Database Performance Tuning

### A. MongoDB Optimization

#### 3.1 Document Modeling

```javascript
// AVOID: Separate collections with references (requires joins)
// Collections: users, investments (with userId reference)

// PREFER: Embed related data when beneficial
const userSchema = new Schema({
  _id: String,
  email: String,
  investments: [{
    name: String,
    amount: Number,
    //... only if limited to <100 items
  }],
});
```

#### 3.2 Aggregation Pipeline

```javascript
// Efficient server-side calculation
const stats = await Investment.aggregate([
  { $match: { userId: new ObjectId(userId) } },
  {
    $group: {
      _id: '$userId',
      totalAmount: { $sum: '$amount' },
      totalValue: { $sum: '$currentValue' },
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      totalAmount: 1,
      totalValue: 1,
      count: 1,
      gainLoss: { $subtract: ['$totalValue', '$totalAmount'] },
    },
  },
]);
```

---

## 4. Monitoring & Profiling

### A. Backend Monitoring

#### 4.1 APM Setup (Node.js)

```javascript
// Install: npm install elastic-apm-node

const apm = require('elastic-apm-node').start({
  serviceName: 'financial-compass-api',
  serverUrl: process.env.APM_SERVER_URL,
  environment: process.env.NODE_ENV,
});
```

#### 4.2 Node Inspector Profiling

```bash
# Start with inspector
node --inspect server.js

# Profile memory
node --heap-prof server.js
# Analyze with: node --prof-process isolate-*.log > profile.txt
```

### B. Frontend Monitoring

#### 4.3 Performance Metrics

```typescript
// Measure Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte

// Send to analytics
getCLS(metric => {
  analytics.send('CLS', metric.value);
});
```

---

## 5. Deployment Optimization

### A. CDN Usage

```bash
# Push assets to CDN
aws s3 sync dist/ s3://your-bucket/ --cache-control "max-age=31536000,immutable"

# Cloudfront distribution for global distribution
```

### B. Database Sharding (Advanced)

```javascript
// For very large datasets, consider sharding
// Shard by userId to distribute data across servers
const getShardNumber = (userId) => {
  return userId.charCodeAt(0) % SHARD_COUNT;
};
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Dashboard Load Time | < 2s | - |
| API Response Time (p95) | < 500ms | - |
| Frontend Bundle Size | < 200KB gzip | - |
| Backend Memory Usage | < 200MB | - |
| Database Query Time (p95) | < 100ms| - |
| Lighthouse Score | > 90 | - |
| First Contentful Paint | < 1.5s | - |
| Largest Contentful Paint | < 2.5s | - |

---

## Quick Wins (Immediate)

1. **Enable GZIP compression** on nginx
2. **Add database indexes** on frequently queried fields
3. **Implement Redis caching** for dashboard data
4. **Code split routes** to reduce bundle size
5. **Lazy load images** and heavy components
6. **Minimize database fields** in API responses
7. **Use .lean()** in Mongoose queries
8. **Implement pagination** for large lists
9. **Add request deduplication** in API client
10. **Profile bundle size** and remove unused dependencies

---

**Generated:** March 2026
**Last Updated:** March 2026

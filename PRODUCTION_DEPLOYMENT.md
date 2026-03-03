# Financial Compass - Production Deployment Guide

## Table of Contents
1. [Project Structure](#project-structure)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Database Setup](#database-setup)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Performance Optimizations](#performance-optimizations)
10. [Troubleshooting](#troubleshooting)

---

## Project Structure

### Recommended Production Folder Structure

```
financial-compass-production/
├── backend/
│   ├── config/                          # Configuration files
│   │   ├── database.js                  # MongoDB configuration
│   │   ├── jwt.js                       # JWT settings
│   │   └── security.js                  # Security headers, CORS, etc.
│   ├── middleware/
│   │   ├── auth.js                      # JWT authentication
│   │   ├── error-handler.js             # Global error handler
│   │   ├── rate-limiter.js              # Rate limiting
│   │   └── logger.js                    # Request logging
│   ├── models/                          # Mongoose schemas
│   ├── routes/                          # API endpoints
│   ├── utils/
│   │   ├── calculations.js              # Financial calculations
│   │   ├── validators.js                # Input validation
│   │   ├── errors.js                    # Custom error classes
│   │   └── logger.js                    # Logging utility
│   ├── services/                        # Business logic services
│   ├── tests/                           # Unit tests
│   ├── .env                             # Environment variables (NOT in git)
│   ├── .env.example                     # Template for .env
│   ├── server.js                        # Application entry point
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/                          # Static assets
│   ├── src/
│   │   ├── components/                  # React components
│   │   ├── pages/                       # Page components
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── lib/
│   │   │   ├── api.ts                   # API client
│   │   │   ├── utils.ts                 # Utility functions
│   │   │   └── calculations.ts          # Financial calculations
│   │   ├── integrations/                # Third-party integrations
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env                             # Environment variables
│   ├── .env.example                     # Template
│   ├── vite.config.ts                   # Vite configuration
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── API.md                           # API documentation
│   ├── DATABASE.md                      # Database schema
│   └── DEPLOYMENT.md                    # This file
│
├── scripts/
│   ├── deploy-backend.sh
│   ├── deploy-frontend.sh
│   └── backup-database.sh
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
└── .github/
    └── workflows/                       # CI/CD pipelines
        ├── backend-tests.yml
        ├── frontend-tests.yml
        └── deploy.yml
```

---

## Pre-Deployment Checklist

- [ ] All environment variables configured in `.env` files
- [ ] Database connection tested and working
- [ ] JWT secret updated (change from default)
- [ ] CORS origins properly configured
- [ ] SSL/TLS certificates obtained
- [ ] Error handling tested for all endpoints
- [ ] Input validation implemented across all forms
- [ ] API rate limiting enabled
- [ ] Logging configured
- [ ] Database backups scheduled
- [ ] Monitoring and alerting setup
- [ ] Security headers configured
- [ ] API documentation complete
- [ ] User authentication tested
- [ ] Password reset flow tested

---

## Environment Setup

### Backend Environment Variables (production)

```bash
# .env file in backend/
PORT=5001
NODE_ENV=production

# Database - Use MongoDB Atlas for production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financial_compass?retryWrites=true&w=majority

# JWT - IMPORTANT: Generate a strong random secret
JWT_SECRET=$(openssl rand -base64 32)  # minimum 32 chars
JWT_EXPIRE=7d

# Security
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
BCRYPT_ROUNDS=12

# API Keys
NEWS_API_KEY=your_production_api_key

# Logging
LOG_LEVEL=warn
# Use 'error' in production for minimal logs
```

### Frontend Environment Variables (production)

```bash
# .env file in frontend/
VITE_API_URL=https://api.yourdomain.com
VITE_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_GA_ID=YOUR_GOOGLE_ANALYTICS_ID
VITE_API_TIMEOUT=30000
VITE_MAX_SESSION_TIMEOUT=3600000
```

### Generate Secure JWT Secret

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Backend Deployment

### 1. Local Testing

```bash
cd backend

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm start

# Should connect to MongoDB and listen on port 5001
```

### 2. Deploy to Cloud (AWS EC2, DigitalOcean, Heroku, etc.)

#### Option A: Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create financial-compass-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=$(openssl rand -base64 32)

# Deploy from Git
git push heroku main

# View logs
heroku logs --tail
```

#### Option B: Docker Deployment

```dockerfile
# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5001

CMD ["node", "server.js"]
```

```bash
# Build image
docker build -t financial-compass-api:latest .

# Run container
docker run -p 5001:5001 \
  -e MONGODB_URI=mongodb+srv://... \
  -e JWT_SECRET=your_secret \
  financial-compass-api:latest
```

#### Option C: AWS EC2 Deployment

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm install 18

# Clone repository
git clone https://github.com/yourusername/financial-compass.git
cd financial-compass/backend

# Install dependencies
npm install

# Create .env file (use secure values)
nano .env

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start server.js --name "financial-compass-api"

# Setup auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 logs financial-compass-api
```

### 3. Verify Deployment

```bash
# Test API health
curl https://api.yourdomain.com/api/dashboard/health

# Check authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## Frontend Deployment

### 1. Build for Production

```bash
cd frontend

# Install dependencies
npm install

# Build optimized bundle
npm run build

# Output: dist/ directory with optimized files
```

### 2. Deploy to Cloud

#### Option A: Vercel Deployment (Recommended for Static Sites)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard:
# - VITE_API_URL=https://api.yourdomain.com
```

#### Option B: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Option C: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Option D: Docker + AWS ECS

```dockerfile
# Dockerfile for frontend
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# nginx.conf
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
  location /api {
    proxy_pass https://api.yourdomain.com;
  }
}
```

### 3. Continuous Deployment with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install & Build Frontend
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create Account & Cluster**
   - Visit https://www.mongodb.com/cloud/atlas
   - Create free or paid cluster
   - Choose region closest to your users

2. **Security Configuration**
   - Create database user with strong password
   - Set IP whitelist (allow your application server IPs)
   - Enable encryption at rest
   - Enable encryption in transit (TLS)

3. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/financial_compass?retryWrites=true&w=majority
   ```

4. **Backup Strategy**
   - MongoDB Atlas automatically backs up data daily
   - Restore from snapshots in dashboard
   - Export data regularly to S3

### Local MongoDB (Development Only)

```bash
# Install MongoDB Community
# https://docs.mongodb.com/manual/installation/

# Start MongoDB
mongod

# Initialize database and collections
mongo financial_compass < backend/sql/setup.mongodb.js
```

---

## Security Hardening

### 1. Application Security

```javascript
// config/security.js
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');

module.exports = (app) => {
  // Helmet - sets HTTP headers for security
  app.use(helmet());
  
  // CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8082'],
    credentials: true,
  }));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later',
  });
  app.use('/api/', limiter);
  
  // Data sanitization against NoSQL injection
  app.use(mongoSanitize());
  
  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '10kb' }));
};
```

### 2. Database Security

- Use connection string with encryption
- Enable authentication
- Regular backups to multiple locations
- Monitor access logs
- Implement least-privilege access

### 3. API Security

- Implement HTTPS/TLS
- Use strong JWT secrets (32+ chars)
- Implement request validation
- Add CSRF protection
- Log and monitor suspicious activities
- Rate limiting on sensitive endpoints

### 4. Frontend Security

- Use Content Security Policy (CSP)
- Implement subresource integrity
- Sanitize user inputs
- Secure localStorage usage
- Use HTTPS only
- Implement session timeout

---

## Monitoring & Maintenance

### 1. Application Monitoring

```javascript
// Example: Using Winston for logging
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Use in routes
router.get('/stats', (req, res) => {
  try {
    logger.info('Dashboard stats requested', { userId: req.userId });
    // ... your code
  } catch (error) {
    logger.error('Dashboard stats error', { error: error.message });
  }
});
```

### 2. Health Checks

```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});
```

### 3. Monitoring Services

- **Application Performance Monitoring (APM)**
  - New Relic
  - DataDog
  - Sentry (error tracking)

- **Infrastructure Monitoring**
  - CloudWatch (AWS)
  - Azure Monitor
  - Prometheus + Grafana

- **Uptime Monitoring**
  - Pingdom
  - Uptime Robot
  - StatusPage

### 4. Database Backups

```bash
#!/bin/bash
# backup-mongodb.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

# Create backup
mongodump --uri="mongodb+srv://..." --out="${BACKUP_DIR}/backup_${TIMESTAMP}"

# Upload to S3
aws s3 sync "${BACKUP_DIR}/backup_${TIMESTAMP}" s3://your-bucket/backups/ --delete

# Keep only last 30 days of backups
find "${BACKUP_DIR}" -type d -mtime +30 -exec rm -rf {} \;
```

---

## Performance Optimizations

### 1. Backend Optimizations

```javascript
// Database indexing
userSchema.index({ email: 1 });
investmentSchema.index({ userId: 1, createdAt: -1 });

// Caching
const redis = require('redis');
const cache = redis.createClient();

router.get('/stats', auth, async (req, res) => {
  const cacheKey = `stats:${req.userId}`;
  
  // Check cache
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  // Fetch data
  const stats = await calculateStats(req.userId);
  
  // Cache for 5 minutes
  await cache.setex(cacheKey, 300, JSON.stringify(stats));
  
  res.json(stats);
});

// Query optimization
const investments = await Investment.find({ userId })
  .select('name currentValue amount') // Only needed fields
  .lean()  // Return plain JS objects
  .limit(1000);  // Prevent memory issues
```

### 2. Frontend Optimizations

```typescript
// Code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Investments = lazy(() => import('./pages/Investments'));

// Image optimization
<img 
  src="/images/logo.webp"
  alt="logo"
  loading="lazy"
/>

// Bundle analysis
// Use: npm run build -- --analyze

// Disable unused CSS
// Configured in tailwind.config.ts with proper content paths
```

### 3. API Response Optimization

```javascript
// Pagination
router.get('/investments', auth, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    Investment.find({ userId }).skip(skip).limit(limit),
    Investment.countDocuments({ userId }),
  ]);
  
  res.json({
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. MongoDB Connection Timeout
```
Error: connection refused
```
**Solution:**
- Check MongoDB is running
- Verify connection string in .env
- Check firewall/security groups
- For MongoDB Atlas: whitelist your IP

#### 2. JWT Authentication Fails
```
Error: Invalid token
```
**Solution:**
- Check JWT_SECRET is correct
- Verify token is being sent in Authorization header
- Check token hasn't expired

#### 3. CORS Errors
```
Access to XMLHttpRequest denied
```
**Solution:**
- Check CORS_ORIGIN in backend .env
- Ensure frontend URL matches exactly
- Check Origin header in request

#### 4. Out of Memory
**Solution:**
- Use pagination for large datasets
- Use .lean() in Mongoose queries
- Implement Redis caching
- Monitor with APM tools

#### 5. High Database Load
**Solution:**
- Add database indexes
- Implement query caching
- Use connection pooling
- Monitor slow queries

### Debug Commands

```bash
# Check backend is running
curl http://localhost:5001/api/dashboard/health

# View backend logs
PM2: pm2 logs financial-compass-api
Docker: docker logs container-id

# Test MongoDB connection
mongosh "mongodb+srv://..."

# Check frontend build
npm run build -- --analyze

# Performance audit
npm run build
npm install -g lighthouse
lighthouse https://yourdomain.com
```

---

## Post-Deployment Verification

- [ ] Backend API responds to requests
- [ ] Frontend loads and displays correctly
- [ ] Login/authentication works
- [ ] API endpoints are protected with authentication
- [ ] Database queries complete in reasonable time
- [ ] No console errors in browser
- [ ] No error logs in backend
- [ ] SSL certificates valid
- [ ] CORS headers correct
- [ ] Rate limiting works
- [ ] Database backups running
- [ ] Monitoring alerts configured

---

## Support & Additional Resources

- **MongoDB Documentation**: https://docs.mongodb.com
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **React Performance**: https://reactjs.org/docs/optimizing-performance.html
- **Security Headers**: https://securityheaders.com
- **API Design**: https://restfulapi.net

---

**Last Updated**: March 2026
**Maintainer**: Financial Compass Team

# ✅ Daily Financial News - Quick Setup Checklist

Complete this checklist to get the Daily Financial News feature up and running.

---

## 📋 Pre-Deployment Checklist

### Backend Setup
- [ ] **Step 1**: Get NewsAPI.org API key
  - [ ] Visit https://newsapi.org/register
  - [ ] Create free account
  - [ ] Copy API key
  - [ ] Save safely

- [ ] **Step 2**: Update backend/.env
  ```bash
  NEWS_API_KEY=your_api_key_here
  NEWS_UPDATE_INTERVAL=60
  NEWS_CATEGORIES=general,india,tech,banking
  NEWS_MAX_ARTICLES=1000
  NEWS_RETENTION_DAYS=30
  ```
  - [ ] NEWS_API_KEY set correctly
  - [ ] NEWS_UPDATE_INTERVAL set (minutes)
  - [ ] Other variables reviewed

- [ ] **Step 3**: Verify backend services
  ```bash
  cd backend
  npm install  # Update dependencies
  npm start    # Start server
  ```
  - [ ] Server starts without errors
  - [ ] Logs show no warnings
  - [ ] http://localhost:5001/api/news responds

### Frontend Setup
- [ ] **Step 4**: Update frontend/.env.local
  ```bash
  VITE_API_URL=http://127.0.0.1:5001/api
  VITE_ENABLE_NEWS_FEATURE=true
  VITE_NEWS_PAGE_SIZE=20
  VITE_NEWS_DEFAULT_CATEGORY=general
  ```
  - [ ] All variables set
  - [ ] API URL matches backend

- [ ] **Step 5**: Verify frontend
  ```bash
  cd frontend
  npm install  # Update dependencies
  npm run dev  # Start dev server
  ```
  - [ ] Frontend loads without errors
  - [ ] No TypeScript errors in console
  - [ ] News page accessible at /news

### Feature Testing
- [ ] **Step 6**: Test News Components
  - [ ] Navigate to /news page
  - [ ] See market summary cards
  - [ ] See category filter buttons
  - [ ] See search input
  - [ ] News articles load (may take 5-10 seconds first time)
  - [ ] Click "Refresh Feed" button works
  - [ ] Filter by category works
  - [ ] Search functionality works
  - [ ] Pagination "Load More" works
  - [ ] Click "Read Full Article" opens in new tab

- [ ] **Step 7**: Verify Backend API
  ```bash
  # Test endpoints
  curl http://localhost:5001/api/news
  curl http://localhost:5001/api/news/categories
  curl http://localhost:5001/api/news/category/tech
  ```
  - [ ] GET /news returns data
  - [ ] GET /categories returns category list
  - [ ] GET /news/:id returns single article
  - [ ] Error handling works (bad category returns 400)

- [ ] **Step 8**: Check Database
  ```bash
  # Connect to MongoDB
  mongo mongodb://localhost:27017/financial_compass
  
  # Check news collection
  db.news.count()
  db.news.findOne()
  db.news.getIndexes()
  ```
  - [ ] News collection created
  - [ ] Articles stored in database
  - [ ] TTL index present
  - [ ] Multiple articles visible

---

## 🚀 Production Deployment Checklist

### Pre-Production
- [ ] All pre-deployment checklist items complete
- [ ] No console errors in browser dev tools
- [ ] No backend warnings in logs
- [ ] Database indexes verified
- [ ] API rate limits understood (100/day on free tier)

### Environment Configuration
- [ ] **Production .env files created** (don't commit!)
  ```bash
  # backend/.env (production)
  NODE_ENV=production
  NEWS_API_KEY=your_production_key
  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/financial_compass
  ```
  - [ ] Separate API key for production
  - [ ] Production MongoDB URI set
  - [ ] NODE_ENV=production
  - [ ] JWT_SECRET changed
  - [ ] All secrets in .env (not in code)

- [ ] **Production .env.local created** (don't commit!)
  ```bash
  # frontend/.env.local (production)
  VITE_API_URL=https://api.yourdomain.com
  VITE_ENV=production
  VITE_ENABLE_NEWS_FEATURE=true
  ```
  - [ ] API URL points to production server
  - [ ] VITE_ENV=production
  - [ ] Other settings reviewed

### Docker Preparation
- [ ] **Backend Docker setup**
  - [ ] Dockerfile reviewed
  - [ ] .dockerignore includes node_modules
  - [ ] Test build locally: `docker build -t compass-api .`
  - [ ] Test run locally: `docker run -p 5001:5001 compass-api`

- [ ] **Frontend Docker setup**
  - [ ] Dockerfile reviewed (multi-stage build)
  - [ ] nginx.conf reviewed
  - [ ] Test build locally
  - [ ] Test run locally

### Database Readiness
- [ ] **MongoDB Atlas Setup** (if using cloud)
  - [ ] Cluster created
  - [ ] Database user created with strong password
  - [ ] IP whitelist configured
  - [ ] Backup enabled
  - [ ] Connection string obtained

- [ ] **Database Optimization**
  - [ ] News collection indexes verified
  - [ ] TTL index working
  - [ ] Encryption at rest enabled
  - [ ] Regular backups scheduled

### Security Review
- [ ] **API Security**
  - [ ] CORS headers properly configured
  - [ ] Rate limiting implemented
  - [ ] Auth middleware on admin endpoints
  - [ ] Input validation on all endpoints
  - [ ] Error messages don't leak sensitive info

- [ ] **Frontend Security**
  - [ ] No API keys in frontend code
  - [ ] Content Security Policy headers set
  - [ ] HTTPS enforced
  - [ ] Form inputs sanitized
  - [ ] XSS protection verified

- [ ] **News API Security**
  - [ ] API key stored in backend .env only
  - [ ] API key rotated regularly
  - [ ] Usage monitoring set up
  - [ ] Alerts for unusual usage

### Performance Verification
- [ ] **Backend Performance**
  - [ ] Database queries use indexes
  - [ ] Response times < 500ms
  - [ ] Memory usage stable
  - [ ] No N+1 query problems

- [ ] **Frontend Performance**
  - [ ] News page loads in < 2 seconds
  - [ ] Images lazy loaded
  - [ ] Bundle size < 200KB (gzipped)
  - [ ] Lighthouse score > 90

- [ ] **Database Performance**
  - [ ] Query plans analyzed
  - [ ] Slow query log reviewed
  - [ ] Index usage verified

### Deployment
- [ ] **Backend Deployment** (Choose one approach)
  
  **Option A: Vercel/Railway**
  - [ ] Connected to GitHub
  - [ ] Environment variables set
  - [ ] Test deployment created
  - [ ] Production deployment approved
  - [ ] Domain configured
  - [ ] HTTPS verified

  **Option B: Docker + VPS**
  - [ ] VPS rented (AWS EC2, DigitalOcean, etc.)
  - [ ] Docker installed on VPS
  - [ ] Docker Compose configured
  - [ ] Nginx reverse proxy set up
  - [ ] SSL certificate (Let's Encrypt)
  - [ ] Domain DNS configured

  **Option C: Traditional Node hosting**
  - [ ] Host supports Node.js 18+
  - [ ] PM2 or similar process manager
  - [ ] Nginx reverse proxy
  - [ ] Systemd service file
  - [ ] SSL certificate

- [ ] **Frontend Deployment** (Choose one approach)
  
  **Option A: Vercel**
  - [ ] Connected to GitHub
  - [ ] Environment variables set
  - [ ] Preview deployment working
  - [ ] Production deployment approved
  - [ ] Domain configured
  - [ ] HTTPS verified

  **Option B: Netlify**
  - [ ] Connected to GitHub
  - [ ] Build settings verified
  - [ ] Environment variables set
  - [ ] Deploy preview working
  - [ ] Domain configured
  - [ ] HTTPS verified

  **Option C: S3 + CloudFront**
  - [ ] S3 bucket created
  - [ ] CloudFront distribution configured
  - [ ] Domain via Route 53
  - [ ] SSL certificate via ACM
  - [ ] Build script configured

### Post-Deployment
- [ ] **Smoke Tests**
  ```bash
  # Test production endpoints
  curl https://api.yourdomain.com/api/news
  curl https://yourdomain.com/news
  ```
  - [ ] API responds
  - [ ] Frontend loads
  - [ ] News articles display
  - [ ] Search works
  - [ ] Filters work
  - [ ] No 404/500 errors

- [ ] **Monitoring Setup**
  - [ ] Error tracking (Sentry, LogRocket)
  - [ ] Performance monitoring (Datadog, New Relic)
  - [ ] Database monitoring
  - [ ] API usage monitoring
  - [ ] Alerts configured

- [ ] **Backup Verification**
  - [ ] Database backups automatic
  - [ ] Backup retention policy set
  - [ ] Test restore from backup
  - [ ] Backup location verified

- [ ] **Documentation Updated**
  - [ ] README.md updated with news setup
  - [ ] API docs updated
  - [ ] Deployment guide created
  - [ ] Team notified

- [ ] **Analytics Setup**
  - [ ] Google Analytics enabled (if using)
  - [ ] News page tracked
  - [ ] User interaction logging
  - [ ] Dashboard created

---

## 🔧 Troubleshooting During Setup

### Issue: News not displaying
```bash
# Check backend logs
tail -f backend/logs/app.log

# Verify API endpoint
curl http://localhost:5001/api/news

# Check database
mongo mongodb://localhost:27017/financial_compass
db.news.count()
```

### Issue: API key not working
```bash
# Verify key format
echo $NEWS_API_KEY  # Should show your key

# Test API directly
curl "https://newsapi.org/v2/everything?q=stocks&apiKey=YOUR_KEY"
```

### Issue: Search/filters not working
```bash
# Check browser console for errors
# Check network tab in DevTools
# Verify CORS headers being set
curl -I http://localhost:5001/api/news
```

### Issue: Slow loading
```bash
# Check response times
curl -o /dev/null -w "@curl-format.txt" http://localhost:5001/api/news

# Optimize query
mongo
db.news.find({ category: 'tech' }).explain("executionStats")
```

---

## 📊 Success Criteria

✅ **Your setup is complete when:**

- [x] News page loads without errors
- [x] Articles display from real NewsAPI data
- [x] Can filter by category (India, Global, Tech, Banking, Crypto)
- [x] Can search articles by keyword
- [x] Can load more articles via pagination
- [x] Can click to read full article (opens in new tab)
- [x] Can refresh news feed manually
- [x] Error messages display properly
- [x] No console errors or warnings
- [x] Backend logs are clean
- [x] Database has articles stored
- [x] All endpoints respond correctly
- [x] Performance is acceptable (< 2s load)

---

## 🎯 Next Steps

After deployment:

1. **Monitor Usage**
   - Check NewsAPI usage dashboard daily (limit: 100/day free)
   - Monitor database storage
   - Check API response times

2. **Gather Feedback**
   - Ask users for feature suggestions
   - Monitor user behavior analytics
   - A/B test different layouts

3. **Plan Improvements**
   - Add more categories
   - Integrate additional news sources
   - Add sentiment analysis
   - Add email notifications for important news

4. **Stay Updated**
   - Monitor dependencies for security updates
   - Keep NewsAPI endpoint updated
   - Review MongoDB best practices
   - Update documentation with learnings

---

## 📞 Support

If you get stuck:

1. **Check logs**: `npm start --debug`
2. **Review documentation**: `NEWS_FEATURE_GUIDE.md`
3. **Test endpoints**: Use curl or Postman
4. **Clear cache**: `rm -rf node_modules && npm install`
5. **Restart services**: Kill and restart backend/frontend

---

**Last Updated:** March 3, 2026  
**Status:** ✅ Production Ready

# financeflow - Quick Start Guide

Get the financeflow application up and running in minutes!

## ⚡ 5-Minute Setup (Development)

### Prerequisites Check
```bash
# Verify Node.js 18+
node --version  # Should be v18.0.0 or higher

# Verify npm
npm --version   # Should be 9+

# Verify MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

### Option 1: Manual Setup

#### Backend
```bash
cd backend
cp .env.example .env
npm install
npm start
```

Server starts on `http://localhost:5001`

#### Frontend (New Terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Application opens at `http://localhost:8082`

### Option 2: Docker Setup (Easiest)

```bash
# With MongoDB Express UI (dev only)
docker-compose --profile dev up -d

# Access points:
# Frontend: http://localhost:8082
# Backend: http://localhost:5001/api
# MongoDB Admin: http://localhost:8081 (admin/pass)

# Stop all services
docker-compose down
```

---

## 📋 Development Workflow

### Terminal 1: Backend
```bash
cd backend
npm install
npm start
# Restarts automatically on file changes
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
# Hot reload on file changes
```

### Terminal 3: MongoDB (if not using Docker)
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Access the Application
- **Frontend**: http://localhost:8082
- **API**: http://localhost:5001/api
- **API Health Check**: http://localhost:5001/api/dashboard/health

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🔨 Common Development Tasks

### Add a New Investment
1. Click "Investments" in sidebar
2. Click "Add Investment" button
3. Fill in:
   - Name: "Test Fund"
   - Type: "Mutual Funds"
   - Investment Amount: 10000
   - Current Value: 12000
4. Click "Add Investment"

### View Dashboard
- Dashboard shows portfolio summary
- Portfolio Value: Total current value
- Invested Amount: Total invested
- Total Returns: Gain/Loss amount
- Annual Return: CAGR percentage

### Create API Request
```bash
# Get all investments
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/investments

# Create investment
curl -X POST http://localhost:5001/api/investments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Fund",
    "type": "mutual_funds",
    "amount": 10000,
    "currentValue": 12000
  }'
```

---

## 🔑 Default Credentials

### Test User
Email: `test@example.com`
Password: `password123`

*(Create this user through registration or check backend seed script)*

### MongoDB
Username: `root`
Password: `rootpassword`
URL: `mongodb://localhost:27017`

---

## 🐛 Debugging

### Backend Debugging
```bash
# Start with debugger
node --inspect server.js

# Open Chrome DevTools
# chrome://inspect
```

### Frontend Debugging
- Open browser DevTools: `F12` or `Right-click → Inspect`
- React DevTools extension recommended (Chrome)
- Console shows API errors and warnings
- Network tab shows all API requests

### Database Debugging
```bash
# Connect to MongoDB
mongosh

# List databases
show databases

# Use financial_compass database
use financial_compass

# Show collections
show collections

# Query investments
db.investments.find({}).pretty()

# Check indexes
db.investments.getIndexes()
```

### Common Issues

**❌ "Cannot find module" error**
```bash
# Solution: Install dependencies again
npm install
npm install --legacy-peer-deps  # If still fails
```

**❌ "Port 5001 already in use"**
```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 PID
```

**❌ "MongoDB connection refused"**
```bash
# Check MongoDB is running
mongosh

# Start MongoDB if not running
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB
```

**❌ "API returns 401 Unauthorized"**
- Login first to get a token
- Add token to Authorization header: `Bearer YOUR_TOKEN`
- Check token hasn't expired (7 days)

**❌ "CORS error in browser"**
- Check `CORS_ORIGIN` in backend `.env`
- Should match frontend URL exactly
- Restart backend after changing `.env`

---

## 📁 File Structure for Quick Reference

```
src/
├── components/
│   ├── investments/PortfolioSummary.tsx    # Shows portfolio stats
│   ├── expense/ExpenseForm.tsx             # Add expenses
│   ├── assets/InvestmentForm.tsx           # Add investments
│   └── ui/                                 # Shared UI components
│
├── pages/
│   ├── Dashboard.tsx                       # Main dashboard
│   ├── Investments.tsx                     # Portfolio page
│   ├── Income.tsx                          # Income tracking
│   └── Auth.tsx                            # Login/Register
│
├── lib/
│   ├── api.ts                              # API client
│   ├── utils.ts                            # Formatting & validation
│   └── calculations.ts                     # Financial calculations
│
└── hooks/
    ├── useAuth.ts                          # Auth logic
    └── useAPI.ts                           # Data fetching
```

---

## 🎨 Making Code Changes

### Update Calculation Logic
```typescript
// File: frontend/src/lib/calculations.ts
export function calculateCAGR(start, end, years) {
  // Your new calculation here
  return result;
}

// Use in component
import { calculateCAGR } from '@/lib/calculations';

const cagr = calculateCAGR(10000, 12000, 1);
```

### Add API Endpoint
```typescript
// File: backend/routes/investments.js
router.get('/custom-endpoint', auth, async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Create New Component
```typescript
// File: frontend/src/components/MyComponent.tsx
import { memo } from 'react';

interface MyComponentProps {
  title: string;
  value: number;
}

export const MyComponent = memo(({ title, value }: MyComponentProps) => {
  return (
    <div>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
});
```

---

## 📦 Installing New Dependencies

```bash
# Backend dependency
cd backend
npm install express-new-package

# Frontend dependency
cd frontend
npm install react-new-package

# Save as dev dependency
npm install --save-dev @types/package

# After installing, restart the server
```

---

## 🚀 Building for Production

```bash
# Build backend (no build required for Node.js, but verify it works)
cd backend
npm start  # Test it runs

# Build frontend
cd frontend
npm run build

# Output: dist/ folder with optimized files
# Ready to deploy!
```

---

## 🔄 Git Workflow

```bash
# Clone the project
git clone https://github.com/username/financial-compass.git
cd financial-compass

# Create a feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add my feature"

# Push to GitHub
git push origin feature/my-feature

# Create Pull Request on GitHub
```

---

## 📚 Documentation Links

- **Calculations**: See `frontend/src/lib/calculations.ts`
- **API Endpoints**: See `backend/routes/`
- **Database Models**: See `backend/models/`
- **Components**: See `frontend/src/components/`

---

## 🔐 Environment Variables Quick Setup

### Backend (.env)
```bash
# Copy example
cp .env.example .env

# Edit and set these:
PORT=5001
MONGODB_URI=mongodb://localhost:27017/financial_compass
JWT_SECRET=dev-secret-key-change-before-production
JWT_EXPIRE=7d
```

### Frontend (.env)
```bash
# Copy example
cp .env.example .env

# Edit and set:
VITE_API_URL=http://127.0.0.1:5001/api
```

---

## ⚙️ Scripts Reference

### Backend Scripts
```bash
npm start           # Start development server
npm test            # Run tests
npm run lint        # Check code quality
npm run build       # Verify build (if configured)
npm run health      # Check if running
```

### Frontend Scripts
```bash
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm test            # Run tests
npm run lint        # Check code quality
npm run type-check  # TypeScript checking
npm run format      # Format code with Prettier
```

---

## 🎯 For Beginners

### Step-by-Step First Run
1. Clone the repo
2. Open terminal and go to `backend` folder
3. Run `npm install`
4. Run `cp .env.example .env`
5. Run `npm start`
6. Open another terminal and go to `frontend` folder
7. Run `npm install`
8. Run `cp .env.example .env`
9. Run `npm run dev`
10. Open http://localhost:8082 in browser
11. Click "Sign In" to create account or login
12. Click "Investments" in sidebar
13. Click "Add Investment" and fill the form

That's it! You now have the app running locally.

---

## 🆘 Quick Help

**Everything crashed?**
```bash
# Kill all Node processes
killall node

# Restart backend and frontend as shown above
```

**Need to reset everything?**
```bash
# Backend
cd backend && rm -rf node_modules && npm install && npm start

# Frontend  
cd frontend && rm -rf node_modules && npm install && npm run dev
```

**Database corrupted?**
```bash
# Clear all data (CAREFUL - deletes everything)
mongosh
use financial_compass
db.dropDatabase()
exit

# Restart backend, it will recreate collections
```

---

## 📞 Need Help?

1. Check error message carefully
2. Look at console logs (terminal or browser DevTools)
3. Search for the error in documentation
4. Check GitHub Issues
5. Ask in Discussions section

---

## ✅ You're Ready!

The setup is complete. You now have:
- ✅ Backend API running on port 5001
- ✅ Frontend running on port 8082
- ✅ MongoDB connected
- ✅ Authentication working
- ✅ All features available

Start building! 🚀

---

**Last Updated**: March 2026  
**Version**: 1.0.0


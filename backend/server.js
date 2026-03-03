require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB Atlas
if (process.env.MONGODB_URI) {
  connectDB().catch(err => {
    console.error('MongoDB connection failed:', err.message);
    console.warn('Running without MongoDB.');
  });
} else {
  console.warn('MONGODB_URI not configured. Running without MongoDB.');
}

const app = express();

app.get('/', (req, res) => {
  res.send('Backend Running 🔥');
});

// Add request logging FIRST
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the dist folder (frontend build) with proper MIME types
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// Routes - wrapped in try-catch
try {
  console.log('Loading authentication route...');
  app.use('/api/auth', require('./routes/auth'));
  
  console.log('Loading profile route...');
  app.use('/api/profile', require('./routes/profile'));
  
  console.log('Loading transactions route...');
  app.use('/api/transactions', require('./routes/transactions'));
  
  console.log('Loading income route...');
  app.use('/api/income', require('./routes/income'));
  
  console.log('Loading expenses route...');
  app.use('/api/expenses', require('./routes/expenses'));
  
  console.log('Loading goals route...');
  app.use('/api/goals', require('./routes/goals'));
  
  console.log('Loading assets route...');
  app.use('/api/assets', require('./routes/assets'));
  
  console.log('Loading liabilities route...');
  app.use('/api/liabilities', require('./routes/liabilities'));
  
  console.log('Loading insurance route...');
  app.use('/api/insurance', require('./routes/insurance'));
  
  console.log('Loading investments route...');
  app.use('/api/investments', require('./routes/investments'));
  
  console.log('Loading savings route...');
  app.use('/api/savings', require('./routes/savings'));
  
  console.log('Loading tax route...');
  app.use('/api/tax', require('./routes/tax'));
  
  console.log('Loading dashboard route...');
  app.use('/api/dashboard', require('./routes/dashboard'));
  
  console.log('Loading news route...');
  app.use('/api/news', require('./routes/news'));
  
  console.log('All routes loaded successfully');
} catch (err) {
  console.error('Error loading routes:', err.message || err);
  console.error(err.stack);
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Setup automatic news updates
const { setupAutomaticNewsUpdates, addSampleNews } = require('./services/newsService');
const newsUpdateInterval = parseInt(process.env.NEWS_UPDATE_INTERVAL || '60'); // minutes
setupAutomaticNewsUpdates(newsUpdateInterval).catch(err => console.error('Error setting up news updates:', err));

// Add sample news in development mode
if (process.env.NODE_ENV === 'development') {
  addSampleNews().catch(err => console.error('Error adding sample news:', err));
}

// Error handling middleware (before catch-all route)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Serve index.html for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

const PORT = process.env.PORT || 5000;

// Initialize database schema and start server
async function startServer() {
  try {
    console.log('Using MongoDB Atlas database');
    
    // Start the server
    app.listen(5001, '0.0.0.0', () => {
      console.log("server running on 5001");
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message || err);
    console.error(err.stack);
    process.exit(1);
  }
}

startServer();

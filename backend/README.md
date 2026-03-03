# financeflow Backend

Node.js/Express + MongoDB backend for the financeflow application.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

Or from the root directory:
```bash
npm run server:install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/financial-compass
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
```

If you prefer MySQL, add these variables instead (or alongside):

```env
# MySQL settings
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=financial_compass
```

To enable MySQL for the backend instead of MongoDB, set this in `backend/.env`:

```env
USE_MYSQL=true
```

**Important**: Change `JWT_SECRET` to a secure random string in production!

### 3. Install and Start MongoDB

#### Option A: Local MongoDB
1. Download and install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financial-compass?retryWrites=true&w=majority
   ```

  ### MySQL (optional)

  If you'd rather use MySQL, ensure you have a MySQL server running and update the `.env` with the `MYSQL_` variables shown above. The project includes a MySQL connection helper at `backend/config/mysql.js` which uses `mysql2`.

  #### Install MySQL
  1. Install MySQL Server for your OS: https://dev.mysql.com/downloads/
  2. Start the MySQL service (platform-specific):
    ```bash
    # Windows (PowerShell)
    net start MySQL

    # macOS (Homebrew)
    brew services start mysql

    # Linux (systemd)
    sudo systemctl start mysql
    ```

  #### Create the database
  ```sql
  CREATE DATABASE IF NOT EXISTS financial_compass;
  ```

  Note: This repository still contains Mongoose models and MongoDB-focused routes. Switching fully to MySQL will require replacing models and queries; the `mysql.js` helper provides a starting point for establishing a connection.

### 4. Start the Backend Server

From the backend directory:
```bash
npm run dev
```

Or from the root directory:
```bash
npm run server:dev
```

The backend will run on `http://localhost:5000`

### 5. Configure Frontend

Create/update `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Install Frontend Dependencies

From the root directory:
```bash
npm install
```

### 7. Run Both Frontend and Backend

From the root directory:
```bash
npm run dev:all
```

This will start:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173` (or another available port)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Routes (require authentication)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Data Endpoints
All require authentication (Bearer token in Authorization header)

- **Income**: `/api/income` (GET, POST, PUT, DELETE)
- **Expenses**: `/api/expenses` (GET, POST, PUT, DELETE)
- **Goals**: `/api/goals` (GET, POST, PUT, DELETE)
- **Assets**: `/api/assets` (GET, POST, PUT, DELETE)
- **Liabilities**: `/api/liabilities` (GET, POST, PUT, DELETE)
- **Insurance**: `/api/insurance` (GET, POST, PUT, DELETE)
- **Investments**: `/api/investments` (GET, POST, PUT, DELETE)
- **Savings**: `/api/savings` (GET, POST, PUT, DELETE)
- **Tax**: `/api/tax` (GET, POST, PUT, DELETE)

### News Endpoints (Auto-updating)
- `GET /api/news` - Get all news articles (with filters & pagination)
- `GET /api/news/featured` - Get featured latest news
- `GET /api/news/categories` - Get available news categories
- `GET /api/news/:id` - Get specific news article
- `POST /api/news` - Create new news article (requires authentication)
- `POST /api/news/refresh` - Manually trigger news refresh (requires authentication)
- `DELETE /api/news/:id` - Delete news article (requires authentication)

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js            # User model
│   ├── Income.js          # Income model
│   ├── Expense.js         # Expense model
│   ├── Goal.js            # Goal model
│   ├── Asset.js           # Asset model
│   ├── Liability.js       # Liability model
│   ├── Insurance.js       # Insurance model
│   ├── Investment.js      # Investment model
│   ├── Savings.js         # Savings model
│   ├── Tax.js             # Tax model
│   └── News.js            # News model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── profile.js         # Profile routes
│   ├── income.js          # Income routes
│   ├── expenses.js        # Expense routes
│   ├── goals.js           # Goals routes
│   ├── assets.js          # Assets routes
│   ├── liabilities.js     # Liabilities routes
│   ├── insurance.js       # Insurance routes
│   ├── investments.js     # Investments routes
│   ├── savings.js         # Savings routes
│   ├── tax.js             # Tax routes
│   └── news.js            # News routes
├── services/
│   └── newsService.js     # News fetching and auto-update service
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
└── server.js              # Express server setup
└── server.js              # Express server setup
```

## Testing the API

### Using cURL

Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'
```

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Get income (replace TOKEN with your JWT):
```bash
curl http://localhost:5000/api/income \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Get news:
```bash
curl http://localhost:5000/api/news
```

Get featured news:
```bash
curl http://localhost:5000/api/news/featured
```

## Automatic News Updates

The application automatically fetches financial news from NewsAPI.org and updates the database at regular intervals. To enable this feature:

### Setup Instructions

1. **Get a NewsAPI Key**
   - Visit https://newsapi.org
   - Sign up for a free account
   - Copy your API key

2. **Configure Environment Variables**
   Add to your `.env` file:
   ```env
   NEWS_API_KEY=your_api_key_here
   NEWS_UPDATE_INTERVAL=60  # Update interval in minutes (default: 60)
   ```

3. **Automatic Updates**
   - News updates run automatically when the server starts
   - Subsequent updates occur at the interval specified (default: every 60 minutes)
   - In development mode, sample news articles are added automatically
   - Old articles (> 30 days) are automatically deleted from the database

### News Categories
- `market` - Stock market and general market news
- `economy` - Economic news and reports
- `stocks` - Specific stock news
- `crypto` - Cryptocurrency and blockchain news
- `commodities` - Commodity prices and news
- `general` - General financial news

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check your connection string in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change the PORT in `.env` file
- Kill the process using port 5000

### CORS Errors
- Backend is configured to accept requests from all origins in development
- Update CORS settings in `server.js` for production

## Migration from Supabase

The frontend API client has been updated to use the new Express backend. The old Supabase integration files are still present if you need to reference them, but the application now uses MongoDB for data storage and JWT for authentication.

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure CORS to only allow your frontend domain
4. Use MongoDB Atlas or a hosted MongoDB instance
5. Deploy to services like Heroku, Railway, or DigitalOcean
6. Set up proper environment variables on your hosting platform

## License

This backend is part of the financeflow project.


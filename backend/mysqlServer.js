const { pool, testConnection } = require('./config/mysql');

function attachPool(req, res, next) {
  req.db = pool;
  next();
}

function registerMysqlHealthRoute(app) {
  app.get('/api/mysql/health', async (req, res) => {
    try {
      await testConnection();
      res.json({ status: 'ok', message: 'MySQL connection healthy' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message || err });
    }
  });
}

async function ensureSchema() {
  const tables = [
    // 1. Users table
    `CREATE TABLE IF NOT EXISTS users (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // 2. Incomes table
    `CREATE TABLE IF NOT EXISTS incomes (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      source VARCHAR(255) NOT NULL,
      amount DECIMAL(20,2) NOT NULL,
      date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      category VARCHAR(100) DEFAULT 'salary',
      description TEXT,
      is_recurring TINYINT(1) DEFAULT 0,
      recurring_frequency VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (user_id),
      INDEX (date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // 3. Expenses table
    `CREATE TABLE IF NOT EXISTS expenses (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      category VARCHAR(100) NOT NULL,
      amount DECIMAL(20,2) NOT NULL,
      merchant VARCHAR(255),
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      payment_method VARCHAR(50),
      is_recurring TINYINT(1) DEFAULT 0,
      recurring_frequency ENUM('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX (user_id),
      INDEX (date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // 4. Assets table
    `CREATE TABLE IF NOT EXISTS assets (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      current_value DECIMAL(20,2) NOT NULL,
      purchase_value DECIMAL(20,2),
      purchase_date DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // 5. Liabilities table
    `CREATE TABLE IF NOT EXISTS liabilities (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      principal_amount DECIMAL(20,2) NOT NULL,
      outstanding_balance DECIMAL(20,2) NOT NULL,
      interest_rate DECIMAL(8,4) NOT NULL,
      tenure_months INT,
      emi_amount DECIMAL(20,2),
      start_date DATETIME,
      next_emi_date DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // 6. Investments table
    `CREATE TABLE IF NOT EXISTS investments (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      amount DECIMAL(20,2) NOT NULL,
      current_value DECIMAL(20,2) NOT NULL,
      purchase_date DATETIME,
      quantity DECIMAL(20,4),
      returns DECIMAL(20,2),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // 7. Savings table
    `CREATE TABLE IF NOT EXISTS savings (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      account_name VARCHAR(255) NOT NULL,
      account_type VARCHAR(100) NOT NULL,
      balance DECIMAL(20,2) NOT NULL,
      interest_rate DECIMAL(8,4),
      bank_name VARCHAR(255),
      account_number VARCHAR(100),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // 8. Insurance table
    `CREATE TABLE IF NOT EXISTS insurance (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      name VARCHAR(255) NOT NULL,
      policy_number VARCHAR(100),
      type VARCHAR(100) NOT NULL,
      provider VARCHAR(255) NOT NULL,
      coverage_amount DECIMAL(20,2) NOT NULL,
      premium_amount DECIMAL(20,2) NOT NULL,
      premium_frequency ENUM('monthly', 'quarterly', 'half-yearly', 'yearly') NOT NULL,
      start_date DATETIME,
      end_date DATETIME,
      next_premium_date DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // 9. Goals table
    `CREATE TABLE IF NOT EXISTS goals (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      name VARCHAR(255) NOT NULL,
      target_amount DECIMAL(20,2) NOT NULL,
      current_amount DECIMAL(20,2) DEFAULT 0,
      deadline DATETIME,
      category VARCHAR(100) NOT NULL,
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      is_completed TINYINT(1) DEFAULT 0,
      notes TEXT,
      recurring_amount DECIMAL(20,2) DEFAULT 0,
      recurring_frequency ENUM('none', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly') DEFAULT 'none',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // 10. Taxes table
    `CREATE TABLE IF NOT EXISTS taxes (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      financial_year VARCHAR(20) NOT NULL,
      total_income DECIMAL(20,2) NOT NULL,
      deductions DECIMAL(20,2) DEFAULT 0,
      taxable_income DECIMAL(20,2) NOT NULL,
      tax_paid DECIMAL(20,2) DEFAULT 0,
      tax_liability DECIMAL(20,2) NOT NULL,
      regime ENUM('old', 'new') DEFAULT 'new',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // 11. News table
    `CREATE TABLE IF NOT EXISTS news (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT NOT NULL,
      content LONGTEXT,
      source VARCHAR(255) DEFAULT 'financeflow',
      category ENUM('market', 'economy', 'stocks', 'crypto', 'commodities', 'general') DEFAULT 'general',
      image_url TEXT,
      article_url TEXT,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 DAY),
      INDEX (created_at),
      INDEX (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];

  try {
    console.log('MySQL: starting table creation...');
    for (let i = 0; i < tables.length; i++) {
      const createTable = tables[i];
      try {
        console.log(`MySQL: creating table ${i + 1}/${tables.length}...`);
        await pool.query(createTable);
        console.log(`MySQL: table ${i + 1} created successfully`);
      } catch (tableErr) {
        // Ignore errors for existing tables or foreign key issues
        if (!tableErr.message.includes('already exists') && 
            !tableErr.message.includes('Foreign key') &&
            !tableErr.message.includes('Duplicate')) {
          console.error('Table creation error:', tableErr.message);
        } else {
          console.log(`MySQL: table ${i + 1} skipped (already exists or FK issue)`);
        }
      }
    }
    console.log('MySQL: ensured all tables exist');
  } catch (err) {
    console.error('MySQL schema error:', err.message || err);
    throw err;
  }
}

module.exports = { attachPool, registerMysqlHealthRoute, ensureSchema };


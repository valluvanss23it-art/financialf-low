-- Complete MySQL Database Setup for financeflow
-- Run this file to create all tables at once

-- Create database
CREATE DATABASE IF NOT EXISTS financial_compass;
USE financial_compass;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS tax;
DROP TABLE IF EXISTS savings;
DROP TABLE IF EXISTS insurance;
DROP TABLE IF EXISTS liabilities;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS incomes;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INCOMES TABLE
-- ============================================
CREATE TABLE incomes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  source VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  date DATE NOT NULL DEFAULT (CURRENT_DATE),
  category VARCHAR(100) DEFAULT 'salary',
  description TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency ENUM('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_date (date),
  INDEX idx_category (category),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ASSETS TABLE
-- ============================================
CREATE TABLE assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  current_value DECIMAL(15, 2) NOT NULL,
  purchase_value DECIMAL(15, 2),
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  merchant VARCHAR(255),
  description TEXT,
  date DATE NOT NULL DEFAULT (CURRENT_DATE),
  payment_method VARCHAR(50),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency ENUM('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_category (category),
  INDEX idx_date (date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- GOALS TABLE
-- ============================================
CREATE TABLE goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) DEFAULT 0,
  deadline DATE,
  category VARCHAR(100) NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  recurring_amount DECIMAL(15, 2) DEFAULT 0,
  recurring_frequency ENUM('none', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly') DEFAULT 'none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_deadline (deadline),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INVESTMENTS TABLE
-- ============================================
CREATE TABLE investments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  current_value DECIMAL(15, 2) NOT NULL,
  purchase_date DATE,
  quantity DECIMAL(15, 4),
  purchase_price DECIMAL(15, 2),
  expected_return DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LIABILITIES TABLE
-- ============================================
CREATE TABLE liabilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL,
  outstanding_balance DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  tenure_months INT,
  emi_amount DECIMAL(15, 2),
  start_date DATE,
  next_emi_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSURANCE TABLE
-- ============================================
CREATE TABLE insurance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  policy_number VARCHAR(100),
  type VARCHAR(100) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  coverage_amount DECIMAL(15, 2) NOT NULL,
  premium_amount DECIMAL(15, 2) NOT NULL,
  premium_frequency ENUM('monthly', 'quarterly', 'half-yearly', 'yearly') NOT NULL,
  start_date DATE,
  end_date DATE,
  next_premium_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_policy_number (policy_number),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAVINGS TABLE
-- ============================================
CREATE TABLE savings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(100) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2),
  bank_name VARCHAR(255),
  account_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_account_type (account_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TAX TABLE
-- ============================================
CREATE TABLE tax (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  financial_year VARCHAR(20) NOT NULL,
  total_income DECIMAL(15, 2) NOT NULL,
  deductions DECIMAL(15, 2) DEFAULT 0,
  taxable_income DECIMAL(15, 2) NOT NULL,
  tax_paid DECIMAL(15, 2) DEFAULT 0,
  tax_liability DECIMAL(15, 2) NOT NULL,
  regime ENUM('old', 'new') DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_financial_year (financial_year),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Display success message
SELECT 'All tables created successfully!' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'financial_compass';


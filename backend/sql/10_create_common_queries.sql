-- Common MySQL Queries for financeflow Application
-- Use these queries in your application routes

-- ============================================
-- USER QUERIES
-- ============================================

-- Get user by email
-- SELECT * FROM users WHERE email = ?;

-- Create new user
-- INSERT INTO users (email, password, full_name) VALUES (?, ?, ?);

-- Update user profile
-- UPDATE users SET full_name = ?, updated_at = NOW() WHERE id = ?;


-- ============================================
-- INCOME QUERIES
-- ============================================

-- Get all income for user
-- SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC;

-- Get income by category
-- SELECT category, SUM(amount) as total FROM incomes WHERE user_id = ? GROUP BY category;

-- Get recurring income
-- SELECT * FROM incomes WHERE user_id = ? AND is_recurring = 1;

-- Create income record
-- INSERT INTO incomes (user_id, source, amount, date, category, description, is_recurring, recurring_frequency) 
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- Update income
-- UPDATE incomes SET source = ?, amount = ?, date = ?, category = ?, description = ?, is_recurring = ?, recurring_frequency = ? 
-- WHERE id = ? AND user_id = ?;

-- Delete income
-- DELETE FROM incomes WHERE id = ? AND user_id = ?;


-- ============================================
-- EXPENSE QUERIES
-- ============================================

-- Get all expenses for user
-- SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC;

-- Get expenses by category
-- SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category;

-- Get expenses for date range
-- SELECT * FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC;

-- Get recurring expenses
-- SELECT * FROM expenses WHERE user_id = ? AND is_recurring = 1;

-- Create expense record
-- INSERT INTO expenses (user_id, category, amount, merchant, description, date, payment_method, is_recurring, recurring_frequency) 
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Update expense
-- UPDATE expenses SET category = ?, amount = ?, merchant = ?, description = ?, date = ?, payment_method = ?, is_recurring = ?, recurring_frequency = ? 
-- WHERE id = ? AND user_id = ?;

-- Delete expense
-- DELETE FROM expenses WHERE id = ? AND user_id = ?;


-- ============================================
-- ASSET QUERIES
-- ============================================

-- Get all assets for user
-- SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC;

-- Get total asset value by type
-- SELECT type, SUM(current_value) as total FROM assets WHERE user_id = ? GROUP BY type;

-- Get asset appreciation
-- SELECT name, type, purchase_value, current_value, 
--        (current_value - purchase_value) as appreciation,
--        ROUND(((current_value - purchase_value) / purchase_value * 100), 2) as appreciation_percent
-- FROM assets WHERE user_id = ? AND purchase_value IS NOT NULL;

-- Create asset
-- INSERT INTO assets (user_id, name, type, current_value, purchase_value, purchase_date, notes) 
-- VALUES (?, ?, ?, ?, ?, ?, ?);

-- Update asset
-- UPDATE assets SET name = ?, type = ?, current_value = ?, purchase_value = ?, purchase_date = ?, notes = ? 
-- WHERE id = ? AND user_id = ?;

-- Delete asset
-- DELETE FROM assets WHERE id = ? AND user_id = ?;


-- ============================================
-- INVESTMENT QUERIES
-- ============================================

-- Get all investments for user
-- SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC;

-- Get total investment value by type
-- SELECT type, SUM(current_value) as total FROM investments WHERE user_id = ? GROUP BY type;

-- Get investment returns
-- SELECT name, type, amount, current_value,
--        (current_value - amount) as gain_loss,
--        ROUND(((current_value - amount) / amount * 100), 2) as return_percent
-- FROM investments WHERE user_id = ?;

-- Create investment
-- INSERT INTO investments (user_id, name, type, amount, current_value, purchase_date, quantity, purchase_price, expected_return, notes) 
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Update investment
-- UPDATE investments SET name = ?, type = ?, amount = ?, current_value = ?, purchase_date = ?, quantity = ?, purchase_price = ?, expected_return = ?, notes = ? 
-- WHERE id = ? AND user_id = ?;

-- Delete investment
-- DELETE FROM investments WHERE id = ? AND user_id = ?;


-- ============================================
-- LIABILITY QUERIES
-- ============================================

-- Get all liabilities for user
-- SELECT * FROM liabilities WHERE user_id = ? ORDER BY created_at DESC;

-- Get total debt by type
-- SELECT type, SUM(outstanding_balance) as total FROM liabilities WHERE user_id = ? GROUP BY type;

-- Get upcoming EMI payments
-- SELECT * FROM liabilities WHERE user_id = ? AND next_emi_date IS NOT NULL ORDER BY next_emi_date ASC;

-- Create liability
-- INSERT INTO liabilities (user_id, name, type, principal_amount, outstanding_balance, interest_rate, tenure_months, emi_amount, start_date, next_emi_date, notes) 
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Update liability
-- UPDATE liabilities SET name = ?, type = ?, principal_amount = ?, outstanding_balance = ?, interest_rate = ?, tenure_months = ?, emi_amount = ?, start_date = ?, next_emi_date = ?, notes = ? 
-- WHERE id = ? AND user_id = ?;

-- Delete liability
-- DELETE FROM liabilities WHERE id = ? AND user_id = ?;


-- ============================================
-- GOAL QUERIES
-- ============================================

-- Get all goals for user
-- SELECT * FROM goals WHERE user_id = ? ORDER BY deadline ASC;

-- Get active goals (not completed)
-- SELECT * FROM goals WHERE user_id = ? AND is_completed = FALSE ORDER BY priority DESC, deadline ASC;

-- Get goal progress
-- SELECT name, target_amount, current_amount,
--        ROUND((current_amount / target_amount * 100), 2) as progress_percent,
--        (target_amount - current_amount) as remaining
-- FROM goals WHERE user_id = ?;

-- Create goal
-- INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, category, priority, is_completed, notes, recurring_amount, recurring_frequency) 
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Update goal
-- UPDATE goals SET name = ?, target_amount = ?, current_amount = ?, deadline = ?, category = ?, priority = ?, is_completed = ?, notes = ?, recurring_amount = ?, recurring_frequency = ? 
-- WHERE id = ? AND user_id = ?;

-- Update goal progress
-- UPDATE goals SET current_amount = current_amount + ? WHERE id = ? AND user_id = ?;

-- Delete goal
-- DELETE FROM goals WHERE id = ? AND user_id = ?;


-- ============================================
-- SAVINGS QUERIES
-- ============================================

-- Get all savings accounts for user
-- SELECT * FROM savings WHERE user_id = ? ORDER BY created_at DESC;

-- Get total savings by account type
-- SELECT account_type, SUM(balance) as total FROM savings WHERE user_id = ? GROUP BY account_type;

-- Create savings account
-- INSERT INTO savings (user_id, account_name, account_type, balance, interest_rate, bank_name, account_number, notes) 
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- Update savings account
-- UPDATE savings SET account_name = ?, account_type = ?, balance = ?, interest_rate = ?, bank_name = ?, account_number = ?, notes = ? 
-- WHERE id = ? AND user_id = ?;

-- Delete savings account
-- DELETE FROM savings WHERE id = ? AND user_id = ?;


-- ============================================
-- INSURANCE QUERIES
-- ============================================

-- Get all insurance policies for user
-- SELECT * FROM insurance WHERE user_id = ? ORDER BY created_at DESC;

-- Get total coverage by type
-- SELECT type, SUM(coverage_amount) as total_coverage FROM insurance WHERE user_id = ? GROUP BY type;

-- Get upcoming premium payments
-- SELECT * FROM insurance WHERE user_id = ? AND next_premium_date IS NOT NULL ORDER BY next_premium_date ASC;

-- Create insurance policy
-- INSERT INTO insurance (user_id, name, policy_number, type, provider, coverage_amount, premium_amount, premium_frequency, start_date, end_date, next_premium_date, notes) 
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Update insurance policy
-- UPDATE insurance SET name = ?, policy_number = ?, type = ?, provider = ?, coverage_amount = ?, premium_amount = ?, premium_frequency = ?, start_date = ?, end_date = ?, next_premium_date = ?, notes = ? 
-- WHERE id = ? AND user_id = ?;

-- Delete insurance policy
-- DELETE FROM insurance WHERE id = ? AND user_id = ?;


-- ============================================
-- TAX QUERIES
-- ============================================

-- Get all tax records for user
-- SELECT * FROM tax WHERE user_id = ? ORDER BY financial_year DESC;

-- Get tax record for specific year
-- SELECT * FROM tax WHERE user_id = ? AND financial_year = ?;

-- Create tax record
-- INSERT INTO tax (user_id, financial_year, total_income, deductions, taxable_income, tax_paid, tax_liability, regime, notes) 
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Update tax record
-- UPDATE tax SET total_income = ?, deductions = ?, taxable_income = ?, tax_paid = ?, tax_liability = ?, regime = ?, notes = ? 
-- WHERE id = ? AND user_id = ?;

-- Delete tax record
-- DELETE FROM tax WHERE id = ? AND user_id = ?;


-- ============================================
-- DASHBOARD QUERIES
-- ============================================

-- Get financial summary for user
-- SELECT 
--   (SELECT COALESCE(SUM(amount), 0) FROM incomes WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE) AND YEAR(date) = YEAR(CURRENT_DATE)) as monthly_income,
--   (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE) AND YEAR(date) = YEAR(CURRENT_DATE)) as monthly_expenses,
--   (SELECT COALESCE(SUM(current_value), 0) FROM assets WHERE user_id = ?) as total_assets,
--   (SELECT COALESCE(SUM(current_value), 0) FROM investments WHERE user_id = ?) as total_investments,
--   (SELECT COALESCE(SUM(outstanding_balance), 0) FROM liabilities WHERE user_id = ?) as total_liabilities,
--   (SELECT COALESCE(SUM(balance), 0) FROM savings WHERE user_id = ?) as total_savings;

-- Get net worth
-- SELECT 
--   (COALESCE((SELECT SUM(current_value) FROM assets WHERE user_id = ?), 0) +
--    COALESCE((SELECT SUM(current_value) FROM investments WHERE user_id = ?), 0) +
--    COALESCE((SELECT SUM(balance) FROM savings WHERE user_id = ?), 0) -
--    COALESCE((SELECT SUM(outstanding_balance) FROM liabilities WHERE user_id = ?), 0)) as net_worth;

-- Get monthly expense breakdown
-- SELECT category, SUM(amount) as total 
-- FROM expenses 
-- WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE) AND YEAR(date) = YEAR(CURRENT_DATE)
-- GROUP BY category 
-- ORDER BY total DESC;

-- Get income vs expense trend (last 6 months)
-- SELECT 
--   DATE_FORMAT(date, '%Y-%m') as month,
--   SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
--   0 as expense
-- FROM incomes 
-- WHERE user_id = ? AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
-- GROUP BY DATE_FORMAT(date, '%Y-%m')
-- UNION ALL
-- SELECT 
--   DATE_FORMAT(date, '%Y-%m') as month,
--   0 as income,
--   SUM(amount) as expense
-- FROM expenses 
-- WHERE user_id = ? AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
-- GROUP BY DATE_FORMAT(date, '%Y-%m')
-- ORDER BY month;


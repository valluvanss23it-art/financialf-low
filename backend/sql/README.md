# MySQL Database Setup and Queries

This directory contains all MySQL schema definitions and query examples for the financeflow application.

## Quick Setup

### Option 1: Run Complete Setup (Recommended)
Run this single file to create all tables:
```bash
mysql -u root -p < setup_all_tables.sql
```

Or using PowerShell:
```powershell
Get-Content setup_all_tables.sql | mysql -u root -p financial_compass
```

### Option 2: Run Individual Files
Create tables one by one in order:
```bash
mysql -u root -p < 00_create_database.sql
mysql -u root -p financial_compass < 01_create_users_table.sql
mysql -u root -p financial_compass < 02_create_assets_table.sql
mysql -u root -p financial_compass < 03_create_expenses_table.sql
# ... continue with remaining files
```

## File Structure

| File | Purpose |
|------|---------|
| `00_create_database.sql` | Creates the `financial_compass` database |
| `01_create_users_table.sql` | Users authentication table |
| `02_create_assets_table.sql` | Asset tracking (property, vehicles, etc.) |
| `03_create_expenses_table.sql` | Expense tracking with categories |
| `04_create_goals_table.sql` | Financial goals and targets |
| `05_create_investments_table.sql` | Investment portfolio tracking |
| `06_create_liabilities_table.sql` | Loans and debts |
| `07_create_insurance_table.sql` | Insurance policies |
| `08_create_savings_table.sql` | Savings accounts |
| `09_create_tax_table.sql` | Tax records by year |
| `10_create_common_queries.sql` | Reference queries for all modules |
| `create_incomes_table.sql` | Income tracking table |
| `setup_all_tables.sql` | Complete database setup in one file |

## Database Schema Overview

### Core Tables
- **users** - User authentication and profile
- **incomes** - Income records with recurring support
- **expenses** - Expense tracking with categorization
- **assets** - Physical and digital assets
- **investments** - Investment portfolio
- **liabilities** - Loans and debts
- **goals** - Financial goals with progress tracking
- **savings** - Savings accounts
- **insurance** - Insurance policies
- **tax** - Annual tax records

### Key Features
- ✅ Foreign key constraints with CASCADE delete
- ✅ Proper indexing for performance
- ✅ Decimal precision for currency (15,2)
- ✅ Timestamp tracking (created_at, updated_at)
- ✅ UTF-8 character support
- ✅ ENUM validation for categories

## Common Queries

All common queries are documented in [10_create_common_queries.sql](./10_create_common_queries.sql).

### Example Queries

#### Get User's Financial Summary
```sql
SELECT 
  (SELECT COALESCE(SUM(amount), 0) FROM incomes WHERE user_id = 1) as total_income,
  (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = 1) as total_expenses,
  (SELECT COALESCE(SUM(current_value), 0) FROM assets WHERE user_id = 1) as total_assets,
  (SELECT COALESCE(SUM(outstanding_balance), 0) FROM liabilities WHERE user_id = 1) as total_liabilities;
```

#### Get Net Worth
```sql
SELECT 
  (COALESCE((SELECT SUM(current_value) FROM assets WHERE user_id = 1), 0) +
   COALESCE((SELECT SUM(current_value) FROM investments WHERE user_id = 1), 0) +
   COALESCE((SELECT SUM(balance) FROM savings WHERE user_id = 1), 0) -
   COALESCE((SELECT SUM(outstanding_balance) FROM liabilities WHERE user_id = 1), 0)) as net_worth;
```

#### Monthly Expense Breakdown
```sql
SELECT category, SUM(amount) as total 
FROM expenses 
WHERE user_id = 1 
  AND MONTH(date) = MONTH(CURRENT_DATE) 
  AND YEAR(date) = YEAR(CURRENT_DATE)
GROUP BY category 
ORDER BY total DESC;
```

## Environment Variables

Update your `.env` file:
```env
# MySQL Configuration
USE_MYSQL=true
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=financial_compass
```

## Testing the Setup

After running the setup, test your connection:
```bash
node backend/test-mysql-setup.js
```

## Verification Commands

### Check Database and Tables
```sql
USE financial_compass;
SHOW TABLES;
```

### Check Table Structure
```sql
DESCRIBE users;
DESCRIBE incomes;
DESCRIBE expenses;
-- etc.
```

### Check Row Counts
```sql
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'incomes', COUNT(*) FROM incomes
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'assets', COUNT(*) FROM assets
UNION ALL
SELECT 'investments', COUNT(*) FROM investments
UNION ALL
SELECT 'liabilities', COUNT(*) FROM liabilities
UNION ALL
SELECT 'goals', COUNT(*) FROM goals
UNION ALL
SELECT 'savings', COUNT(*) FROM savings
UNION ALL
SELECT 'insurance', COUNT(*) FROM insurance
UNION ALL
SELECT 'tax', COUNT(*) FROM tax;
```

## Migration from MongoDB

If you're migrating from MongoDB:

1. Export your MongoDB data:
```bash
mongoexport --db=financial-compass --collection=users --out=users.json
```

2. Convert and import to MySQL (custom script needed)

3. Update your backend `.env` to use MySQL:
```env
USE_MYSQL=true
```

## Troubleshooting

### Connection Issues
```bash
# Test MySQL connection
mysql -u root -p -e "SELECT 1"

# Check if database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'financial_compass'"
```

### Permission Issues
```sql
-- Grant permissions to user
GRANT ALL PRIVILEGES ON financial_compass.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Reset Database
```sql
DROP DATABASE IF EXISTS financial_compass;
-- Then run setup_all_tables.sql again
```

## Notes

- All currency values use `DECIMAL(15, 2)` for precision
- User IDs are integers (auto-increment)
- Dates use MySQL `DATE` type
- Timestamps use `TIMESTAMP` with automatic updates
- Foreign keys ensure referential integrity
- Indexes optimize common queries

## Support

For issues or questions, refer to:
- [Backend README](../README.md)
- [MySQL Setup Guide](../MYSQL_SETUP.md)


# AWS RDS Setup Guide for financeflow

This guide explains how to deploy your financeflow backend to AWS with RDS (MySQL) and optional DynamoDB.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Node.js installed locally

## Step 1: Create AWS RDS MySQL Database

### Via AWS Console:

1. Go to AWS RDS Console
2. Click "Create database"
3. Choose **MySQL** as engine
4. Select **Free tier** (or your preferred tier)
5. Configure:
   - DB instance identifier: `financial-compass-db`
   - Master username: `admin`
   - Master password: (create a secure password)
   - DB instance size: `db.t3.micro` (or larger)
   - Storage: 20 GB (minimum)
   - Enable **Public access** if connecting from outside AWS
6. Additional configuration:
   - Initial database name: `financial_compass`
   - Enable **automated backups**
   - Set backup retention period

### Via AWS CLI:

```bash
aws rds create-db-instance \
  --db-instance-identifier financial-compass-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --db-name financial_compass \
  --publicly-accessible
```

## Step 2: Configure Security Group

1. Go to RDS → Databases → Select your database
2. Click on the VPC security group
3. Edit inbound rules:
   - Add rule: MySQL/Aurora (port 3306)
   - Source: Your IP address (for development) or `0.0.0.0/0` (for public access - not recommended for production)

## Step 3: Get RDS Endpoint

1. Go to your RDS database in AWS Console
2. Copy the **Endpoint** (e.g., `financial-compass-db.abc123.us-east-1.rds.amazonaws.com`)
3. Note the **Port** (usually 3306)

## Step 4: Update Backend Environment Variables

Create a `.env` file in your `backend` folder:

```env
# Enable AWS RDS
USE_AWS_RDS=true
USE_MYSQL=true

# AWS RDS Connection
DB_HOST=financial-compass-db.abc123.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASS=your-secure-password
DB_NAME=financial_compass
DB_SSL_REJECT_UNAUTHORIZED=true

# AWS Region (if using DynamoDB)
AWS_REGION=us-east-1

# JWT
JWT_SECRET=your-production-secret-key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=production
```

## Step 5: Initialize Database Tables

Run the SQL setup scripts on your RDS database:

### Option A: Using MySQL Workbench or CLI

```bash
# Connect to RDS
mysql -h financial-compass-db.abc123.us-east-1.rds.amazonaws.com -P 3306 -u admin -p

# Run setup scripts
SOURCE backend/sql/setup_all_tables.sql;
```

### Option B: Using Node.js script

```bash
cd backend
node -e "
const mysql = require('mysql2/promise');
const fs = require('fs');

async function setup() {
  const conn = await mysql.createConnection({
    host: 'YOUR_RDS_ENDPOINT',
    user: 'admin',
    password: 'YOUR_PASSWORD',
    database: 'financial_compass',
    ssl: { rejectUnauthorized: true },
    multipleStatements: true
  });
  
  const sql = fs.readFileSync('./sql/setup_all_tables.sql', 'utf8');
  await conn.query(sql);
  console.log('Database tables created successfully');
  await conn.end();
}

setup().catch(console.error);
"
```

## Step 6: Test Connection

```bash
cd backend
npm install
node -e "require('./config/mysql').testConnection().then(() => console.log('RDS Connected!')).catch(console.error)"
```

## Step 7: Deploy Backend

### Option A: Deploy to AWS Lambda (Serverless)

1. Install Serverless Framework:
```bash
npm install -g serverless
```

2. Create `serverless.yml` in backend folder (example provided)

3. Deploy:
```bash
serverless deploy
```

### Option B: Deploy to AWS EC2

1. Launch an EC2 instance
2. SSH into the instance
3. Install Node.js
4. Clone your repository
5. Install dependencies:
```bash
cd backend
npm install
```

6. Start with PM2:
```bash
npm install -g pm2
pm2 start server.js --name financial-compass-backend
pm2 save
pm2 startup
```

### Option C: Deploy to AWS Elastic Beanstalk

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize:
```bash
cd backend
eb init
```

3. Create environment and deploy:
```bash
eb create financial-compass-env
eb deploy
```

## Step 8: Optional - Add DynamoDB (for caching/analytics)

If you want to use DynamoDB alongside RDS:

1. Create DynamoDB table:
```bash
aws dynamodb create-table \
  --table-name financial-compass-data \
  --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
  --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

2. Add to `.env`:
```env
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=financial-compass-data
```

## Security Best Practices

1. **Never commit `.env` files** - Use AWS Secrets Manager or Parameter Store
2. **Use SSL/TLS** - Always enable SSL for RDS connections
3. **Restrict Security Groups** - Only allow necessary IP ranges
4. **Rotate Credentials** - Change RDS passwords regularly
5. **Enable Encryption** - Use RDS encryption at rest
6. **Use IAM Authentication** - For enhanced security (optional)

## Cost Optimization

- Use **RDS Free Tier** (db.t3.micro with 20GB storage)
- Enable **Auto Scaling** for storage
- Set up **CloudWatch alarms** for monitoring
- Use **Reserved Instances** for production (cost savings)

## Monitoring

Set up CloudWatch monitoring:
- CPU utilization
- Database connections
- Read/Write latency
- Storage space

## Backup & Recovery

- **Automated backups**: Enabled by default (7-day retention)
- **Manual snapshots**: Create before major changes
- **Point-in-time recovery**: Available for automated backups

## Connection String Summary

**Local Development:**
```
mysql://root@localhost:3306/financial_compass
```

**AWS RDS Production:**
```
mysql://admin:password@your-endpoint.rds.amazonaws.com:3306/financial_compass?ssl=true
```

---

## Troubleshooting

### Cannot connect to RDS
- Check security group rules
- Verify RDS is publicly accessible (if needed)
- Check VPC settings
- Verify credentials

### SSL Connection Issues
```env
DB_SSL_REJECT_UNAUTHORIZED=false  # Only for testing
```

### Connection Timeout
- Increase connectionLimit in mysql.js
- Check network latency
- Consider using RDS Proxy

---

Your backend is now configured to work with both local MySQL and AWS RDS. Toggle between them using the `USE_AWS_RDS` environment variable.


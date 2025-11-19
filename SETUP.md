# AFBS Setup Guide

Complete guide for setting up the Agentic Framework Benchmark System.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Data Collection](#data-collection)
7. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **PostgreSQL**: v14 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB minimum

### Optional Requirements

- **Redis**: For caching (improves performance)
- **GitHub Token**: For data collection (higher rate limits)
- **Anthropic API Key**: For agentic judge features

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agentic_framework_benchmark
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

This will install dependencies for all packages:
- Root workspace
- API package
- Web package
- Database package
- Collector package

### 3. Verify Installation

```bash
# Check Node.js version
node --version  # Should be >= v20.0.0

# Check npm version
npm --version   # Should be >= v10.0.0

# Check PostgreSQL
psql --version  # Should be >= 14
```

## Database Setup

### Option 1: Local PostgreSQL

#### Install PostgreSQL

**macOS (Homebrew)**:
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows**:
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE afbs;

# Create user (optional)
CREATE USER afbs_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE afbs TO afbs_user;

# Exit psql
\q
```

### Option 2: Cloud PostgreSQL

#### Neon (Recommended for Development)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use in `.env` file

#### Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (Session mode)
5. Use in `.env` file

#### Railway

1. Sign up at [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string
5. Use in `.env` file

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Edit Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/afbs

# Optional but recommended
GITHUB_TOKEN=ghp_your_token_here

# Optional (for future features)
ANTHROPIC_API_KEY=sk-ant-your_key_here
REDIS_URL=redis://localhost:6379

# API Configuration
API_PORT=3000
API_HOST=localhost

# Web Configuration
PUBLIC_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 3. Get GitHub Token (Recommended)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `public_repo`, `read:org`
4. Generate and copy token
5. Add to `.env` as `GITHUB_TOKEN`

**Why?** Increases rate limit from 60 to 5,000 requests/hour

## Running the Application

### 1. Run Database Migrations

```bash
npm run db:migrate
```

Expected output:
```
🚀 Starting database migration...
✅ Migration completed successfully!
```

### 2. Seed Initial Data

```bash
npm run db:seed
```

Expected output:
```
🌱 Starting database seeding...
📊 Inserting frameworks...
  ✓ LangChain
  ✓ LlamaIndex
  ✓ AutoGPT
  ...
✅ Seeding completed successfully!
📈 Inserted 8 frameworks
```

### 3. Start Development Servers

**Option A: Start all servers together**
```bash
npm run dev
```

**Option B: Start servers separately**

Terminal 1 (API):
```bash
npm run dev:api
```

Terminal 2 (Web):
```bash
npm run dev:web
```

### 4. Verify Running Services

- **API**: http://localhost:3000/health
  - Should return: `{"status":"ok","timestamp":"..."}`

- **Web**: http://localhost:5173
  - Should show the AFBS homepage

- **API Docs**: http://localhost:3000/api/v1/frameworks
  - Should return JSON with framework data

## Data Collection

### Initial Data Collection

After seeding, collect real data from GitHub:

```bash
npm run collect
```

This will:
1. Fetch GitHub metrics for all frameworks
2. Calculate scores based on collected data

Expected runtime: 1-2 minutes (depending on GitHub rate limits)

### Scheduled Collection (Production)

Set up cron jobs or use a task scheduler:

```bash
# Daily at midnight (GitHub metrics)
0 0 * * * cd /path/to/afbs && npm run collect:github

# Weekly on Sunday (scores)
0 0 * * 0 cd /path/to/afbs && npm run collect:scores
```

## Troubleshooting

### Database Connection Errors

**Error**: `ECONNREFUSED` or `connection refused`

**Solutions**:
1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. Verify connection string in `.env`
3. Test connection:
   ```bash
   psql "postgresql://user:password@localhost:5432/afbs"
   ```

### Migration Errors

**Error**: `relation "frameworks" already exists`

**Solution**: Reset database
```bash
npm run db:reset
npm run db:migrate
npm run db:seed
```

### API Server Won't Start

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: Port already in use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change API_PORT in .env
API_PORT=3001
```

### GitHub Rate Limit Errors

**Error**: `API rate limit exceeded`

**Solutions**:
1. Add `GITHUB_TOKEN` to `.env`
2. Wait for rate limit reset (shown in error message)
3. Reduce collection frequency

### Frontend Build Errors

**Error**: Module not found or build failures

**Solutions**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear SvelteKit cache
rm -rf packages/web/.svelte-kit
cd packages/web && npm run dev
```

### Data Not Showing in UI

**Checklist**:
1. Database has data: `psql afbs -c "SELECT COUNT(*) FROM frameworks;"`
2. API is running: `curl http://localhost:3000/api/v1/frameworks`
3. Check browser console for errors
4. Verify `PUBLIC_API_URL` in `.env`

## Advanced Configuration

### Custom Database Schema

To modify the schema:

1. Edit `packages/database/schema.sql`
2. Reset and migrate:
   ```bash
   npm run db:reset
   npm run db:migrate
   npm run db:seed
   ```

### Adding Custom Frameworks

Edit `packages/database/scripts/seed.js`:

```javascript
const seedFrameworks = [
  // Add your framework here
  {
    name: 'My Framework',
    slug: 'my-framework',
    description: 'Description here',
    repository_url: 'https://github.com/user/repo',
    // ... other fields
  },
  // ... existing frameworks
];
```

Then run:
```bash
npm run db:seed
npm run collect
```

### Performance Optimization

For large datasets:

1. Enable PostgreSQL connection pooling
2. Add Redis for caching
3. Enable API rate limiting
4. Use CDN for static assets

## Next Steps

1. ✅ Verify all services are running
2. ✅ Check the web interface at http://localhost:5173
3. ✅ Test API endpoints at http://localhost:3000
4. ✅ Run data collection: `npm run collect`
5. 📖 Read the [README.md](README.md) for more information
6. 🚀 Start building!

## Getting Help

- Check the [README.md](README.md)
- Review API documentation
- Check GitHub Issues
- Review error logs in console

---

**Setup Guide Version**: 1.0.0
**Last Updated**: 2025-11-19

# AFBS Deployment Guide

Guide for deploying the Agentic Framework Benchmark System to production.

## Deployment Options

### Option 1: Cloudflare (Recommended)

**Best for**: Low cost, global CDN, serverless

#### Prerequisites
- Cloudflare account
- Neon or Supabase PostgreSQL database

#### Deploy Frontend (Cloudflare Pages)

1. Connect repository to Cloudflare Pages
2. Configure build settings:
   ```
   Build command: cd packages/web && npm install && npm run build
   Build output directory: packages/web/build
   Root directory: /
   ```

3. Set environment variables:
   ```
   PUBLIC_API_URL=https://your-api.workers.dev
   ```

4. Deploy

#### Deploy API (Cloudflare Workers)

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Create `packages/api/wrangler.toml`:
   ```toml
   name = "afbs-api"
   main = "server.js"
   compatibility_date = "2024-01-01"

   [vars]
   API_PORT = "8787"

   [[kv_namespaces]]
   binding = "CACHE"
   id = "your-kv-id"
   ```

3. Deploy:
   ```bash
   cd packages/api
   wrangler deploy
   ```

### Option 2: Vercel + Railway

**Best for**: Easy deployment, good DX

#### Deploy Frontend (Vercel)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Configure `vercel.json`:
   ```json
   {
     "buildCommand": "cd packages/web && npm run build",
     "outputDirectory": "packages/web/build",
     "framework": "sveltekit"
   }
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

#### Deploy API (Railway)

1. Create Railway project
2. Connect GitHub repository
3. Set root directory: `packages/api`
4. Set start command: `node server.js`
5. Add PostgreSQL service
6. Set environment variables
7. Deploy

### Option 3: VPS (DigitalOcean, Linode, AWS)

**Best for**: Full control, custom requirements

#### Server Setup

1. Provision Ubuntu 22.04 server
2. Install dependencies:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib

   # Install Nginx
   sudo apt install -y nginx

   # Install PM2
   sudo npm install -g pm2
   ```

3. Clone repository:
   ```bash
   git clone <repo-url> /var/www/afbs
   cd /var/www/afbs
   npm install
   ```

4. Set up PostgreSQL:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE afbs;
   CREATE USER afbs_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE afbs TO afbs_user;
   \q
   ```

5. Configure environment:
   ```bash
   cp .env.example .env
   nano .env  # Edit configuration
   ```

6. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

7. Build frontend:
   ```bash
   cd packages/web
   npm run build
   ```

#### Process Management (PM2)

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'afbs-api',
      cwd: '/var/www/afbs/packages/api',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        API_PORT: 3000
      }
    },
    {
      name: 'afbs-collector',
      cwd: '/var/www/afbs/packages/collector',
      script: 'collect.js',
      cron_restart: '0 0 * * *',
      autorestart: false
    }
  ]
};
```

Start services:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/afbs`:
```nginx
# API server
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/afbs/packages/web/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/afbs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

## Environment Variables

### Production Environment Variables

```env
# Database (required)
DATABASE_URL=postgresql://user:password@host:5432/afbs

# GitHub (required for data collection)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# API Configuration
API_PORT=3000
API_HOST=0.0.0.0
NODE_ENV=production

# Frontend
PUBLIC_API_URL=https://api.yourdomain.com

# Optional: Redis for caching
REDIS_URL=redis://host:6379

# Optional: Anthropic for agentic judge
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Security
CORS_ORIGIN=https://yourdomain.com
```

## Database Migration in Production

### Before Deployment

1. Backup existing database:
   ```bash
   pg_dump -h host -U user afbs > backup_$(date +%Y%m%d).sql
   ```

2. Test migration on staging:
   ```bash
   # Staging database
   DATABASE_URL=staging_url npm run db:migrate
   ```

3. Run migration on production:
   ```bash
   # Production database
   DATABASE_URL=production_url npm run db:migrate
   ```

### Zero-Downtime Migration

1. Use database migration tools with transactions
2. Deploy new code without breaking changes
3. Run migration during low-traffic period
4. Keep rollback SQL ready

## Performance Optimization

### Database

1. **Add indexes**:
   ```sql
   CREATE INDEX CONCURRENTLY idx_frameworks_slug ON frameworks(slug);
   CREATE INDEX CONCURRENTLY idx_scores_date ON scores(collection_date DESC);
   ```

2. **Connection pooling**:
   ```javascript
   // In db.js
   const pool = new Pool({
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

3. **Query optimization**:
   - Use EXPLAIN ANALYZE
   - Add proper WHERE clauses
   - Limit result sets

### API

1. **Add Redis caching**:
   ```javascript
   import Redis from 'ioredis';
   const redis = new Redis(process.env.REDIS_URL);

   // Cache framework list
   const cacheKey = 'frameworks:all';
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);

   // ... fetch from database
   await redis.setex(cacheKey, 3600, JSON.stringify(data));
   ```

2. **Rate limiting**:
   ```javascript
   import { RateLimiter } from 'limiter';
   const limiter = new RateLimiter({
     tokensPerInterval: 100,
     interval: 'minute'
   });
   ```

3. **Compression**:
   ```javascript
   import { compress } from 'hono/compress';
   app.use('/*', compress());
   ```

### Frontend

1. **Enable SvelteKit adapter optimizations**
2. **Add CDN for static assets**
3. **Enable browser caching**
4. **Optimize images**
5. **Code splitting**

## Monitoring

### Application Monitoring

1. **Sentry** (Error tracking):
   ```bash
   npm install @sentry/node
   ```

   ```javascript
   import * as Sentry from '@sentry/node';
   Sentry.init({ dsn: process.env.SENTRY_DSN });
   ```

2. **Uptime monitoring**:
   - UptimeRobot
   - Pingdom
   - StatusCake

3. **Log aggregation**:
   - Better Stack (Logtail)
   - Papertrail
   - Datadog

### Database Monitoring

1. **Query performance**:
   ```sql
   -- Enable pg_stat_statements
   CREATE EXTENSION pg_stat_statements;

   -- View slow queries
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

2. **Connection monitoring**:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

## Backup Strategy

### Automated Backups

1. **PostgreSQL** (Daily):
   ```bash
   # Add to crontab
   0 2 * * * pg_dump -h host -U user afbs | gzip > /backups/afbs_$(date +\%Y\%m\%d).sql.gz
   ```

2. **File storage** (Weekly):
   ```bash
   0 0 * * 0 tar -czf /backups/files_$(date +\%Y\%m\%d).tar.gz /var/www/afbs
   ```

3. **Retention policy**:
   - Daily backups: Keep 7 days
   - Weekly backups: Keep 4 weeks
   - Monthly backups: Keep 12 months

### Disaster Recovery

1. **Test restores monthly**:
   ```bash
   gunzip < backup.sql.gz | psql -h host -U user afbs_test
   ```

2. **Document recovery procedures**
3. **Keep offsite backups**

## Security Checklist

- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Sanitize user inputs
- [ ] Use prepared statements
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Implement CORS properly
- [ ] Use secure headers

## Scaling Considerations

### Horizontal Scaling

1. **Load balancer** (Nginx/HAProxy)
2. **Multiple API instances**
3. **Read replicas** for database
4. **CDN** for static assets

### Vertical Scaling

1. Increase server resources
2. Optimize database queries
3. Add Redis caching
4. Enable compression

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm test
      - run: npm run build
      - name: Deploy to production
        run: |
          # Your deployment script here
```

## Health Checks

### API Health Check

```javascript
app.get('/health', async (c) => {
  try {
    // Check database
    await pool.query('SELECT 1');

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      error: error.message
    }, 503);
  }
});
```

### Monitoring Endpoints

```javascript
app.get('/metrics', async (c) => {
  return c.json({
    frameworks: await getFrameworkCount(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  });
});
```

## Troubleshooting Production Issues

### High CPU Usage

1. Check slow queries
2. Review API request patterns
3. Check for memory leaks
4. Scale horizontally

### Database Connection Errors

1. Check connection pool settings
2. Verify database is accessible
3. Check firewall rules
4. Review connection limits

### Memory Issues

1. Check for memory leaks
2. Optimize data queries
3. Add pagination
4. Increase server RAM

## Support

For production support:
- Check logs: `pm2 logs`
- Database status: `psql afbs -c "\l"`
- Disk space: `df -h`
- Memory: `free -h`
- Processes: `pm2 status`

---

**Deployment Guide Version**: 1.0.0
**Last Updated**: 2025-11-19

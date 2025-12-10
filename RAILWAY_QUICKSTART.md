# Railway Deployment - Quick Start Guide

Deploy your What's Up Addis backend to Railway in 15 minutes.

## 🎯 What You'll Deploy

1. **PostgreSQL Database** - Managed database
2. **API Service** - Express REST API
3. **Crawler Service** - Event scraping service

## 📋 Prerequisites

- Railway account ([Sign up here](https://railway.app))
- GitHub repository with your code
- 15 minutes of your time

## 🚀 Quick Deployment (Using Dashboard)

### Step 1: Create Project

1. Go to [Railway Dashboard](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your `whats-up-addis` repository
4. Click **"Deploy Now"**

### Step 2: Add PostgreSQL Database

1. In your project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait ~30 seconds for provisioning
4. Note: Railway auto-generates `DATABASE_URL`

### Step 3: Configure API Service

1. Click **"+ New"** → **"Empty Service"**
2. Name it: `api`
3. Click **"Settings"**
4. Set **"Source"**: Connect to your GitHub repo
5. Set **"Root Directory"**: `/`
6. Set **"Dockerfile Path"**: `apps/api/Dockerfile`

**Add Environment Variables:**

Click **"Variables"** tab and add:

```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
JWT_SECRET = your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN = 7d
API_PORT = 3001
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret
```

**Enable Public Access:**

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the public URL (e.g., `https://api-production-xxxx.up.railway.app`)

### Step 4: Run Database Migration

1. Click on your **API service**
2. Go to **"Settings"** → **"Deploy"**
3. Under **"Custom Start Command"**, temporarily add:
   ```
   pnpm --filter @whats-up-addis/database db:migrate:prod && pnpm start
   ```
4. Click **"Deploy"**

Or use Railway CLI:
```bash
railway run --service api pnpm --filter @whats-up-addis/database db:migrate:prod
```

### Step 5: Configure Crawler Service

1. Click **"+ New"** → **"Empty Service"**
2. Name it: `crawler`
3. Click **"Settings"**
4. Set **"Source"**: Connect to your GitHub repo
5. Set **"Root Directory"**: `/`
6. Set **"Dockerfile Path"**: `apps/crawler/Dockerfile`

**Add Environment Variables:**

```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
CRAWLER_SCHEDULE = 0 */6 * * *
CRAWLER_USER_AGENT = WhatsUpAddis/1.0
```

### Step 6: Deploy & Verify

1. Both services should auto-deploy
2. Check **Logs** tab for each service
3. API should show: `🚀 API server running on http://localhost:3001`
4. Test API health: `https://your-api-url.railway.app/health`

## 🛠️ Alternative: Using Railway CLI

### Install CLI

```bash
npm install -g @railway/cli
railway login
```

### Deploy with One Command

```bash
# Run the setup script
./scripts/railway-setup.sh
```

Or manually:

```bash
# Initialize project
railway init

# Add database in dashboard, then:

# Deploy API
railway service api
railway up

# Deploy Crawler
railway service crawler
railway up
```

## 🔐 Environment Variables Explained

### API Service

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | Use Railway reference: `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | Auth token secret | Generate: `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` (7 days) |
| `API_PORT` | Server port | `3001` |
| `CLOUDINARY_*` | Image upload service | Get from [Cloudinary](https://cloudinary.com) |

### Crawler Service

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | Use Railway reference: `${{Postgres.DATABASE_URL}}` |
| `CRAWLER_SCHEDULE` | Cron schedule | `0 */6 * * *` (every 6 hours) |
| `CRAWLER_USER_AGENT` | Bot identification | `WhatsUpAddis/1.0` |

## 📊 Monitoring

### View Logs

**In Dashboard:**
- Click on service → **"Logs"** tab

**Using CLI:**
```bash
railway logs --service api
railway logs --service crawler
```

### Metrics

Each service shows:
- CPU usage
- Memory usage
- Network traffic
- Deployment history

## 🔄 Updating Your App

### Option 1: Automatic CI/CD with GitHub Actions (Recommended)

**Setup once, deploy automatically:**

1. **Configure GitHub Actions** (see [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)):
   ```bash
   # Add these secrets to GitHub repository settings:
   # - RAILWAY_TOKEN
   # - RAILWAY_PROJECT_ID
   ```

2. **Deploy automatically on push:**
   ```bash
   git add .
   git commit -m "Update API"
   git push origin main
   # GitHub Actions automatically builds and deploys to Railway
   ```

**Benefits:**
- ✅ Automatic deployment on push to main
- ✅ Runs tests before deploying
- ✅ Automatic database migrations
- ✅ Deployment notifications
- ✅ Rollback capability

### Option 2: Railway Auto-Deploy (Simple)

Railway can auto-deploy directly from GitHub:

```bash
git add .
git commit -m "Update API"
git push origin main
# Railway automatically detects and deploys
```

**Note:** This doesn't run tests or migrations automatically.

### Option 3: Manual Deploy (CLI)

Deploy manually when needed:

```bash
railway up --service api
railway up --service crawler
```

## 🐛 Troubleshooting

### API won't start

**Check logs for common issues:**

1. **Prisma Client Error**
   ```
   Error: Cannot find module '@prisma/client'
   ```
   **Fix**: Ensure Dockerfile runs `pnpm db:generate`

2. **Database Connection Failed**
   ```
   Error: P1001: Can't reach database server
   ```
   **Fix**: Verify `DATABASE_URL` is set correctly

3. **Port Binding Error**
   ```
   Error: EADDRINUSE
   ```
   **Fix**: Use `process.env.PORT || 3001` in your code

### Crawler crashes

1. **Puppeteer Error**
   ```
   Error: Failed to launch chrome
   ```
   **Fix**: Ensure Dockerfile installs Chromium dependencies

2. **Memory Issues**
   ```
   JavaScript heap out of memory
   ```
   **Fix**: Increase service memory in Railway settings

### Database Issues

1. **Migration Failed**
   ```
   Error: Migration engine error
   ```
   **Fix**: Check database connection and run:
   ```bash
   railway run --service api pnpm --filter @whats-up-addis/database db:migrate:prod
   ```

## 💰 Pricing

Railway Pricing:
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage

**Estimated monthly cost for What's Up Addis:**
- PostgreSQL: ~$5-10
- API Service: ~$5-10
- Crawler Service: ~$5
- **Total**: ~$15-25/month

## 🔗 Connect Frontend

After deployment, update your Next.js app:

```env
# apps/web/.env.production
NEXT_PUBLIC_API_URL=https://your-api-production.up.railway.app
```

Redeploy your Vercel frontend to use the new API URL.

## ✅ Verification Checklist

- [ ] PostgreSQL database is running
- [ ] API service is deployed and healthy
- [ ] API health endpoint returns 200 OK
- [ ] Crawler service is running without errors
- [ ] Database migrations completed successfully
- [ ] Environment variables are set correctly
- [ ] Public URL is accessible
- [ ] Frontend can connect to API

## 📚 Additional Resources

- [Full Deployment Guide](./RAILWAY_DEPLOYMENT.md) - Detailed instructions
- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Troubleshooting Guide](https://docs.railway.app/guides/troubleshooting)

## 🆘 Get Help

- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Support**: Available in dashboard
- **Status Page**: [status.railway.app](https://status.railway.app/)

## 🎉 Next Steps

After successful deployment:

1. ✅ Test all API endpoints
2. ✅ Verify crawler is running
3. ✅ Update frontend to use new API URL
4. ✅ Monitor logs for errors
5. ✅ Set up custom domain (optional)
6. ✅ Configure alerts and notifications

---

**Need the detailed guide?** See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

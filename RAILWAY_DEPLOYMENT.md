# Railway Deployment Guide

This guide walks you through deploying the What's Up Addis backend services on Railway.

## Architecture

- **Database**: PostgreSQL (Railway-managed)
- **API Service**: Express REST API (Port 3001)
- **Crawler Service**: Event scraping service with Puppeteer
- **Web Frontend**: Next.js (deployed separately on Vercel)

## Prerequisites

1. Railway account ([Sign up here](https://railway.app))
2. Railway CLI installed: `npm install -g @railway/cli`
3. Git repository connected to Railway

## Deployment Steps

### 1. Create a New Railway Project

```bash
# Login to Railway
railway login

# Create a new project
railway init
```

Or create a project via the [Railway Dashboard](https://railway.app/new).

### 2. Add PostgreSQL Database

In the Railway dashboard:
1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway will automatically provision a PostgreSQL database
3. Copy the `DATABASE_URL` from the database service variables

### 3. Deploy the API Service

#### Option A: Using Railway Dashboard

1. Click **"+ New"** → **"Empty Service"**
2. Name it `api`
3. Connect your GitHub repository
4. Set **Root Directory** to `/` (monorepo root)
5. Set **Dockerfile Path** to `apps/api/Dockerfile`
6. Add environment variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-production-jwt-secret-change-this
JWT_EXPIRES_IN=7d
API_PORT=3001
CLOUDINARY_CLOUD_NAME=dlvwfihop
CLOUDINARY_API_KEY=389946338527992
CLOUDINARY_API_SECRET=XIEzHQGBP2DR9R40ES5pStc4PW0
```

7. In **Settings** → **Networking**:
   - Enable **Public Networking**
   - Railway will generate a public URL (e.g., `https://api-production-xxxx.up.railway.app`)

8. Deploy the service

#### Option B: Using Railway CLI

```bash
# Link to your Railway project
railway link

# Set the service context
railway service api

# Set environment variables
railway variables set DATABASE_URL="<your-postgres-url>"
railway variables set JWT_SECRET="your-production-jwt-secret"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set API_PORT="3001"
railway variables set CLOUDINARY_CLOUD_NAME="dlvwfihop"
railway variables set CLOUDINARY_API_KEY="389946338527992"
railway variables set CLOUDINARY_API_SECRET="XIEzHQGBP2DR9R40ES5pStc4PW0"

# Deploy
railway up --service api
```

### 4. Run Database Migrations

After the API service is deployed, run migrations:

```bash
# Using Railway CLI
railway run pnpm --filter @whats-up-addis/database db:migrate:prod
```

Or add a migration step to the API Dockerfile before the start command:

```dockerfile
# Add before CMD in apps/api/Dockerfile
RUN pnpm --filter @whats-up-addis/database db:migrate:prod
```

### 5. Deploy the Crawler Service

1. Click **"+ New"** → **"Empty Service"**
2. Name it `crawler`
3. Connect your GitHub repository
4. Set **Root Directory** to `/` (monorepo root)
5. Set **Dockerfile Path** to `apps/crawler/Dockerfile`
6. Add environment variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
CRAWLER_SCHEDULE=0 */6 * * *
CRAWLER_USER_AGENT=WhatsUpAddis/1.0
```

7. Deploy the service

**Note**: The crawler service doesn't need public networking since it only connects to the database.

### 6. Seed the Database (Optional)

If you want to seed your database with initial data:

```bash
railway run pnpm --filter @whats-up-addis/database db:seed
```

## Environment Variables Reference

### API Service (`apps/api`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | Yes |
| `API_PORT` | API server port (default: 3001) | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

### Crawler Service (`apps/crawler`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `CRAWLER_SCHEDULE` | Cron schedule for crawler | No |
| `CRAWLER_USER_AGENT` | User agent string | No |

### Database Service

Railway automatically manages PostgreSQL and provides:
- `DATABASE_URL` - Full connection string
- Individual components (host, port, user, password, database)

## Railway Service Configuration

### Reference Environment Variables

You can reference other services' variables using Railway's template syntax:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
API_URL=${{api.RAILWAY_PUBLIC_DOMAIN}}
```

### Health Checks

Railway automatically monitors your services. For custom health checks:

1. Go to **Settings** → **Health Check**
2. Set path to `/health` (you may need to add a health endpoint to your API)

### Resource Allocation

Railway provides:
- **Shared CPU**: Default for all services
- **Memory**: Up to 8GB per service
- **Disk**: Ephemeral, data stored in PostgreSQL

## Monitoring and Logs

### View Logs

```bash
# View API logs
railway logs --service api

# View crawler logs
railway logs --service crawler

# View database logs
railway logs --service postgres
```

Or view in the Railway dashboard under each service's **Logs** tab.

### Metrics

Railway provides built-in metrics:
- CPU usage
- Memory usage
- Network traffic
- Request count (for public services)

## Connecting Services

### Internal Networking

Services can communicate using private networking:

```env
# API service can reference database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Services can reference each other
INTERNAL_API_URL=${{api.RAILWAY_PRIVATE_DOMAIN}}
```

### Public URLs

Each service with public networking enabled gets:
- A Railway-provided domain: `https://service-production-xxxx.up.railway.app`
- Option to add custom domains

## Updating Your Application

### Automatic Deployments

Railway automatically deploys when you push to your connected branch:

```bash
git add .
git commit -m "Update API"
git push origin main
```

### Manual Deployments

```bash
railway up --service api
railway up --service crawler
```

### Rollbacks

In the Railway dashboard:
1. Go to the service's **Deployments** tab
2. Find the previous deployment
3. Click **"Rollback"**

## Troubleshooting

### Common Issues

1. **Prisma Client not generated**
   - Ensure `pnpm db:generate` runs in the Dockerfile
   - Check that `@prisma/client` is in dependencies

2. **Database connection fails**
   - Verify `DATABASE_URL` is correctly set
   - Check database service is running

3. **Crawler fails to start**
   - Ensure Chromium dependencies are installed
   - Check Puppeteer configuration

4. **Port conflicts**
   - Railway automatically assigns `PORT` environment variable
   - Update your API to use `process.env.PORT || 3001`

### Debugging

```bash
# SSH into a service
railway shell --service api

# Run commands in the service environment
railway run --service api node --version
```

## Cost Optimization

Railway offers:
- **Hobby Plan**: $5/month per user + usage
- **Pro Plan**: $20/month per user + usage

Tips to reduce costs:
1. Use a single database for all services
2. Enable sleep mode for non-production services
3. Monitor resource usage in the dashboard

## CI/CD Integration

### Automated Deployments with GitHub Actions

Your repository includes pre-configured GitHub Actions workflows for automated Railway deployments.

**Quick Setup:**

1. **Get Railway Token:**
   ```bash
   # Go to https://railway.app/account/tokens
   # Create a new token
   ```

2. **Add GitHub Secrets:**
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Add `RAILWAY_TOKEN` (your Railway token)
   - Add `RAILWAY_PROJECT_ID` (from `railway status`)

3. **Push to main branch:**
   ```bash
   git push origin main
   # GitHub Actions automatically deploys to Railway
   ```

**Workflow Files:**
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) - Quality checks and builds
- [`.github/workflows/deploy-api.yml`](.github/workflows/deploy-api.yml) - API deployment
- [`.github/workflows/deploy-crawler.yml`](.github/workflows/deploy-crawler.yml) - Crawler deployment

**For detailed setup instructions, see:** [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

### Manual CLI Deployment

You can still deploy manually using Railway CLI:

```bash
# Deploy specific service
railway up --service api
railway up --service crawler
```

## Custom Domains

1. Go to service **Settings** → **Networking**
2. Click **"Add Domain"**
3. Add your custom domain (e.g., `api.whatsupaddis.com`)
4. Update DNS records as instructed

## Security Best Practices

1. **Rotate JWT secrets** regularly
2. **Use environment variables** for all secrets
3. **Enable HTTPS** (automatic with Railway)
4. **Limit database access** to Railway services only
5. **Monitor logs** for suspicious activity

## Next Steps

After deployment:
1. Update your Next.js frontend's `NEXT_PUBLIC_API_URL` to point to the Railway API URL
2. Test all API endpoints
3. Monitor logs for any errors
4. Set up alerts in Railway dashboard

## Useful Links

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Railway Templates](https://railway.app/templates)
- [Community Discord](https://discord.gg/railway)

## Support

If you encounter issues:
1. Check Railway status page: https://status.railway.app/
2. Join Railway Discord for community support
3. Contact Railway support through the dashboard

# GitHub Actions CI/CD Setup for Railway Deployment

Complete guide to setting up automated deployments to Railway using GitHub Actions.

## 📋 Overview

Your CI/CD pipeline includes:

1. **CI Workflow** - Runs on every push/PR
   - Linting
   - Type checking
   - Build verification

2. **Deploy API Workflow** - Runs on push to `main` (when API files change)
   - Builds API
   - Deploys to Railway
   - Runs database migrations

3. **Deploy Crawler Workflow** - Runs on push to `main` (when crawler files change)
   - Builds crawler
   - Deploys to Railway

## 🚀 Quick Setup

### Step 1: Get Railway Token

1. Login to Railway: https://railway.app
2. Go to **Account Settings** → **Tokens**
3. Click **"Create Token"**
4. Copy the token (starts with `railway_`)

### Step 2: Get Railway Project ID

```bash
# Login to Railway CLI
railway login

# Link to your project
railway link

# Get project ID
railway status
```

Or get it from the Railway dashboard URL:
```
https://railway.app/project/{PROJECT_ID}
```

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `RAILWAY_TOKEN` | Railway API token | From Railway account settings |
| `RAILWAY_PROJECT_ID` | Your Railway project ID | From `railway status` or dashboard URL |
| `NEXT_PUBLIC_API_URL` | API URL for frontend builds | Your Railway API public URL |

**Optional secrets (if not set in Railway dashboard):**
- `DATABASE_URL` - Set in Railway service variables instead
- `JWT_SECRET` - Set in Railway service variables instead
- `CLOUDINARY_*` - Set in Railway service variables instead

### Step 4: Configure Railway Services

Ensure your Railway services are named correctly:
- API service: `api`
- Crawler service: `crawler`
- Database service: `Postgres`

If your service names are different, update the workflow files.

### Step 5: Test the Pipeline

```bash
# Make a change to trigger deployment
git add .
git commit -m "test: trigger deployment"
git push origin main
```

Watch the deployment in:
- **GitHub**: Actions tab
- **Railway**: Deployments tab for each service

## 📂 Workflow Files

### CI Workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml))

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**
1. Quality checks (lint + type-check) for web, api, crawler
2. Build frontend
3. Build backend

### Deploy API ([.github/workflows/deploy-api.yml](.github/workflows/deploy-api.yml))

**Triggers:**
- Push to `main` branch
- Changes in:
  - `apps/api/**`
  - `packages/shared/**`
  - `packages/database/**`
  - `.github/workflows/deploy-api.yml`

**Steps:**
1. Install dependencies
2. Generate Prisma client
3. Build API
4. Deploy to Railway
5. Run database migrations
6. Verify deployment

### Deploy Crawler ([.github/workflows/deploy-crawler.yml](.github/workflows/deploy-crawler.yml))

**Triggers:**
- Push to `main` branch
- Changes in:
  - `apps/crawler/**`
  - `packages/shared/**`
  - `packages/database/**`
  - `.github/workflows/deploy-crawler.yml`

**Steps:**
1. Install dependencies
2. Generate Prisma client
3. Build crawler
4. Deploy to Railway
5. Verify deployment

## 🔧 Configuration

### Service Names

If your Railway services have different names, update the workflows:

```yaml
# In deploy-api.yml and deploy-crawler.yml
railway up --service YOUR_SERVICE_NAME --detach
```

### Deployment Branches

To deploy from branches other than `main`:

```yaml
on:
  push:
    branches: [main, staging, develop]  # Add your branches
```

### Path Filters

The workflows only run when specific files change. To modify:

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'apps/api/**'           # Modify these paths
      - 'packages/shared/**'
      - 'your/custom/path/**'
```

### Environment-Specific Deployments

To deploy to different Railway environments:

```yaml
- name: Deploy to Staging
  if: github.ref == 'refs/heads/develop'
  run: railway up --service api --environment staging

- name: Deploy to Production
  if: github.ref == 'refs/heads/main'
  run: railway up --service api --environment production
```

## 🔐 Security Best Practices

### 1. Token Security

- ✅ **DO**: Use GitHub Secrets for Railway tokens
- ✅ **DO**: Rotate tokens regularly
- ❌ **DON'T**: Commit tokens to the repository
- ❌ **DON'T**: Log tokens in workflow output

### 2. Environment Variables

Set sensitive variables in Railway dashboard, not GitHub Secrets:

```bash
# Set in Railway
railway variables set JWT_SECRET=your-secret --service api
railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}} --service api
```

### 3. Branch Protection

Enable branch protection for `main`:
1. Go to **Settings** → **Branches**
2. Add rule for `main`
3. Enable:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Require pull request reviews

## 📊 Monitoring Deployments

### GitHub Actions

View deployment status:
```
https://github.com/YOUR_USERNAME/whats-up-addis/actions
```

### Railway Dashboard

Monitor services:
```
https://railway.app/project/YOUR_PROJECT_ID
```

### View Logs

**Via Railway CLI:**
```bash
railway logs --service api
railway logs --service crawler
```

**Via Railway Dashboard:**
1. Go to your project
2. Click on service (API or Crawler)
3. Click **"Logs"** tab

## 🐛 Troubleshooting

### Deployment Fails with "Railway not linked"

**Error:**
```
Error: No project found
```

**Solution:**
Check that `RAILWAY_PROJECT_ID` secret is set correctly:
```bash
railway status  # Get your project ID
```

### Authentication Error

**Error:**
```
Error: Invalid token
```

**Solution:**
1. Generate new Railway token
2. Update `RAILWAY_TOKEN` in GitHub Secrets

### Service Not Found

**Error:**
```
Error: Service 'api' not found
```

**Solution:**
Verify service names match in Railway dashboard and workflow files.

### Migration Fails

**Error:**
```
Error: Migration failed
```

**Solution:**
1. Check DATABASE_URL is set in Railway
2. Verify Prisma schema is correct
3. Run migration manually:
```bash
railway run --service api pnpm --filter @whats-up-addis/database db:migrate:prod
```

### Build Fails

**Error:**
```
Error: Build failed
```

**Solution:**
1. Check CI workflow passes first
2. Verify all dependencies are in package.json
3. Test build locally:
```bash
pnpm install
pnpm db:generate
pnpm --filter @whats-up-addis/api build
```

## 🔄 Workflow Optimization

### Cache Dependencies

The workflows already cache pnpm dependencies:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'pnpm'  # Caches pnpm store
```

### Skip CI on Docs Changes

Add to commit message to skip CI:
```bash
git commit -m "docs: update README [skip ci]"
```

### Parallel Deployments

To deploy API and Crawler in parallel when both change:

```yaml
# Create a new workflow: deploy-all.yml
jobs:
  deploy-api:
    # API deployment steps

  deploy-crawler:
    # Crawler deployment steps
    # Remove 'needs: deploy-api' for parallel execution
```

## 📈 Advanced Configuration

### Add Slack Notifications

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Deployment Status Badge

Add to your README.md:

```markdown
![Deploy API](https://github.com/YOUR_USERNAME/whats-up-addis/workflows/Deploy%20API%20(Railway)/badge.svg)
![Deploy Crawler](https://github.com/YOUR_USERNAME/whats-up-addis/workflows/Deploy%20Crawler%20(Railway)/badge.svg)
```

### Rollback on Failure

```yaml
- name: Deploy to Railway
  id: deploy
  run: railway up --service api --detach

- name: Rollback on Failure
  if: failure()
  run: |
    echo "Deployment failed, rolling back..."
    railway rollback --service api
```

### Health Check After Deployment

```yaml
- name: Health Check
  run: |
    sleep 30  # Wait for deployment
    response=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.API_URL }}/health)
    if [ $response -eq 200 ]; then
      echo "Health check passed"
    else
      echo "Health check failed with status $response"
      exit 1
    fi
```

## 📝 Deployment Checklist

Before enabling automated deployments:

- [ ] Railway project created
- [ ] Railway services configured (api, crawler, Postgres)
- [ ] Environment variables set in Railway dashboard
- [ ] Railway token generated
- [ ] GitHub secrets configured
- [ ] Service names match in workflows and Railway
- [ ] CI workflow passes
- [ ] Manual deployment tested
- [ ] Branch protection enabled (optional)
- [ ] Team notified of automatic deployments

## 🆘 Getting Help

### Check Workflow Logs

1. Go to **Actions** tab in GitHub
2. Click on failed workflow
3. Click on failed job
4. Expand failed step to see logs

### Railway Status

Check Railway status page:
```
https://status.railway.app/
```

### Support Channels

- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Discussions**: Enable in repository settings
- **Railway Support**: Available in Railway dashboard

## 🎉 Next Steps

After setting up CI/CD:

1. ✅ Test deployment with a small change
2. ✅ Monitor first deployment in both GitHub and Railway
3. ✅ Verify health endpoints work
4. ✅ Set up monitoring/alerting (optional)
5. ✅ Document deployment process for team
6. ✅ Consider adding staging environment

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Railway Deployments Guide](https://docs.railway.app/deploy/deployments)
- [pnpm CI Guide](https://pnpm.io/continuous-integration)

---

**Need manual deployment?** See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

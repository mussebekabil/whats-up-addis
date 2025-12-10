# GitHub Actions Workflows

Automated CI/CD pipelines for What's Up Addis.

## 📋 Workflows

### 1. CI - Quality Checks & Build ([ci.yml](./ci.yml))

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**What it does:**
- Runs linting for all packages
- Runs type checking for all packages
- Builds frontend and backend

**Status:** ✅ Always active

---

### 2. Deploy API ([deploy-api.yml](./deploy-api.yml))

**Triggers:**
- Push to `main` branch
- When these files change:
  - `apps/api/**`
  - `packages/shared/**`
  - `packages/database/**`
  - `.github/workflows/deploy-api.yml`

**What it does:**
1. Installs dependencies
2. Generates Prisma client
3. Builds API
4. Deploys to Railway
5. Runs database migrations
6. Verifies deployment

**Required Secrets:**
- `RAILWAY_TOKEN` - Railway API token
- `RAILWAY_PROJECT_ID` - Railway project ID

**Status:** ⚙️ Requires setup (see below)

---

### 3. Deploy Crawler ([deploy-crawler.yml](./deploy-crawler.yml))

**Triggers:**
- Push to `main` branch
- When these files change:
  - `apps/crawler/**`
  - `packages/shared/**`
  - `packages/database/**`
  - `.github/workflows/deploy-crawler.yml`

**What it does:**
1. Installs dependencies
2. Generates Prisma client
3. Builds crawler
4. Deploys to Railway
5. Verifies deployment

**Required Secrets:**
- `RAILWAY_TOKEN` - Railway API token
- `RAILWAY_PROJECT_ID` - Railway project ID

**Status:** ⚙️ Requires setup (see below)

---

## 🚀 Quick Setup

### Step 1: Get Railway Credentials

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Get project ID
railway status
```

Or get Railway token from: https://railway.app/account/tokens

### Step 2: Add GitHub Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add these secrets:

| Secret Name | Value | Where to Get |
|------------|-------|--------------|
| `RAILWAY_TOKEN` | Your Railway token | https://railway.app/account/tokens |
| `RAILWAY_PROJECT_ID` | Your project ID | From `railway status` or dashboard URL |
| `NEXT_PUBLIC_API_URL` | API URL (optional) | Your Railway API public URL |

### Step 3: Test

```bash
# Push to main to trigger deployment
git add .
git commit -m "test: trigger deployment"
git push origin main
```

Check workflow status in the **Actions** tab.

---

## 📖 Detailed Setup

For complete setup instructions, see: [GITHUB_ACTIONS_SETUP.md](../../GITHUB_ACTIONS_SETUP.md)

---

## 🔧 Customization

### Change Deployment Branch

To deploy from a different branch:

```yaml
on:
  push:
    branches: [staging]  # Change this
```

### Deploy to Multiple Environments

```yaml
- name: Deploy to Environment
  run: |
    if [ "${{ github.ref }}" == "refs/heads/main" ]; then
      railway up --service api --environment production
    elif [ "${{ github.ref }}" == "refs/heads/develop" ]; then
      railway up --service api --environment staging
    fi
```

### Add Slack Notifications

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🐛 Troubleshooting

### Workflow doesn't run

**Check:**
- Are you pushing to the `main` branch?
- Did the relevant files change?
- Is the workflow enabled?

### Authentication failed

**Fix:**
- Verify `RAILWAY_TOKEN` is set correctly
- Generate new token if needed
- Check token has correct permissions

### Service not found

**Fix:**
- Verify service names in Railway match workflow:
  - API service: `api`
  - Crawler service: `crawler`
- Update workflow if names are different

---

## 📊 Monitoring

### View Workflow Runs

```
https://github.com/YOUR_USERNAME/whats-up-addis/actions
```

### View Railway Deployments

```
https://railway.app/project/YOUR_PROJECT_ID
```

### Check Logs

**GitHub Actions:**
- Go to Actions tab
- Click on workflow run
- Expand steps to view logs

**Railway:**
```bash
railway logs --service api
railway logs --service crawler
```

---

## 🔒 Security

- ✅ Secrets are encrypted in GitHub
- ✅ Secrets are not visible in logs
- ✅ Token has minimal required permissions
- ✅ Rotate tokens regularly

---

## 📚 Resources

- [GitHub Actions Setup Guide](../../GITHUB_ACTIONS_SETUP.md) - Detailed setup
- [Railway Deployment Guide](../../RAILWAY_DEPLOYMENT.md) - Railway configuration
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Railway CLI Docs](https://docs.railway.app/develop/cli)

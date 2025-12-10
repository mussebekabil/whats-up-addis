# Quick Reference - Railway Deployment with GitHub Actions

One-page reference for deploying What's Up Addis.

## 🚀 Initial Setup (One Time)

### 1. Get Railway Credentials
```bash
railway login
railway link
railway status  # Copy project ID
```

Go to https://railway.app/account/tokens → Create token

### 2. Add GitHub Secrets
Go to: **Settings** → **Secrets and variables** → **Actions**

Add:
- `RAILWAY_TOKEN` = `railway_xxxxxxxxxxxxx`
- `RAILWAY_PROJECT_ID` = `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 3. Create Railway Services

In Railway Dashboard:
1. Add **PostgreSQL** database
2. Create **api** service → Set Dockerfile path: `apps/api/Dockerfile`
3. Create **crawler** service → Set Dockerfile path: `apps/crawler/Dockerfile`
4. Add environment variables (see below)

### 4. Deploy
```bash
git push origin main
```

Done! ✅

---

## 📝 Environment Variables

### API Service (Railway Dashboard)
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate with: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
API_PORT=3001
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Crawler Service (Railway Dashboard)
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
CRAWLER_SCHEDULE=0 */6 * * *
CRAWLER_USER_AGENT=WhatsUpAddis/1.0
```

---

## 🔄 Daily Workflow

```bash
# Make changes
git add .
git commit -m "your message"
git push origin main

# GitHub Actions automatically:
# 1. Runs CI checks
# 2. Deploys API (if changed)
# 3. Deploys Crawler (if changed)
# 4. Runs migrations
```

---

## 📊 Monitoring

### View GitHub Actions
```
https://github.com/YOUR_USERNAME/whats-up-addis/actions
```

### View Railway Logs
```bash
railway logs --service api
railway logs --service crawler
```

Or in Railway Dashboard → Service → Logs tab

---

## 🐛 Quick Troubleshooting

### CI Fails
```bash
# Run locally first
pnpm install
pnpm db:generate
pnpm lint
pnpm type-check
pnpm build
```

### Deployment Fails - "Railway not linked"
**Fix:** Check `RAILWAY_PROJECT_ID` in GitHub secrets

### Deployment Fails - "Service not found"
**Fix:** Verify service names in Railway match:
- API service: `api`
- Crawler service: `crawler`

### Migration Fails
```bash
railway run --service api pnpm --filter @whats-up-addis/database db:migrate:prod
```

### Check Service Health
```bash
curl https://your-api-url.railway.app/health
```

---

## 🔧 Common Commands

### Railway CLI
```bash
railway login                  # Login
railway link                   # Link project
railway status                 # Show status
railway logs --service api     # View logs
railway up --service api       # Manual deploy
railway run --service api      # Run command
```

### Manual Deploy (if needed)
```bash
railway up --service api
railway up --service crawler
```

### Check Workflow Status
```bash
# Go to GitHub Actions tab
# Or use GitHub CLI:
gh run list
gh run view <run-id>
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Quality checks |
| `.github/workflows/deploy-api.yml` | API deployment |
| `.github/workflows/deploy-crawler.yml` | Crawler deployment |
| `apps/api/Dockerfile` | API container |
| `apps/crawler/Dockerfile` | Crawler container |
| `.env.railway.example` | Env vars template |

---

## 📚 Full Documentation

| Guide | When to Use |
|-------|-------------|
| [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) | Setting up CI/CD |
| [RAILWAY_QUICKSTART.md](RAILWAY_QUICKSTART.md) | First time Railway setup |
| [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) | Detailed Railway info |
| [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) | Complete overview |

---

## 🔐 Security Checklist

- [ ] `RAILWAY_TOKEN` in GitHub secrets (not in code)
- [ ] `JWT_SECRET` in Railway dashboard (not in GitHub)
- [ ] `DATABASE_URL` uses Railway reference: `${{Postgres.DATABASE_URL}}`
- [ ] Secrets not logged in workflows
- [ ] Branch protection enabled on main
- [ ] Rotate tokens regularly

---

## 🎯 Service URLs

After deployment, get your URLs:

### API
```
https://api-production-xxxx.up.railway.app
```
Test: `curl https://your-api-url/health`

### Frontend (Vercel)
Set environment variable:
```
NEXT_PUBLIC_API_URL=https://api-production-xxxx.up.railway.app
```

---

## 🆘 Quick Help

**GitHub Actions failing?**
→ Check Actions tab for logs

**Railway deployment failing?**
→ Check Railway dashboard logs

**Environment variable missing?**
→ Set in Railway dashboard (not GitHub)

**Service not accessible?**
→ Enable public networking in Railway

**Need to rollback?**
→ Railway dashboard → Service → Deployments → Rollback

---

## ⚡ Speed Tips

1. **Skip CI on docs:** Add `[skip ci]` to commit message
2. **Deploy faster:** Path triggers only deploy when relevant files change
3. **Parallel deploys:** API and Crawler deploy independently
4. **Cache enabled:** Dependencies are cached in workflows

---

**Need more info?** See full documentation in [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)

# Quick Deploy Checklist

## Step 1: Prepare Code ✅

```bash
# Ensure everything is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Deploy to Vercel (5 minutes)

### Option A: Web UI (Easiest)

1. Visit: https://vercel.com/new
2. Import your GitHub repo
3. Set Root Directory: `apps/web`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `http://localhost:3001` (temporary)
5. Click **Deploy**

### Option B: CLI (Faster)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /Users/alemum/Documents/projects/whats-up-addis
vercel --prod
```

## Step 3: Verify Deployment

Visit your Vercel URL: `https://your-app.vercel.app`

Should see the homepage (API features won't work until backend is deployed)

## Step 4: Setup CI/CD (Optional - 5 minutes)

### Get Required Tokens:

1. **Vercel Token**: https://vercel.com/account/tokens → Create Token
2. **Project Settings**: Vercel Dashboard → Settings → General
   - Copy Project ID
   - Copy Org ID

### Add to GitHub Secrets:

Repository → Settings → Secrets → Actions → New repository secret

```
VERCEL_TOKEN=<token>
VERCEL_ORG_ID=<org-id>
VERCEL_PROJECT_ID=<project-id>
```

### Test:

```bash
git add .
git commit -m "Test CI/CD"
git push origin main
```

Check: GitHub → Actions tab (should see workflow running)

---

## Environment Variables Needed

### Now (for Vercel):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Later (after Railway deployment):

```
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

---

## Troubleshooting

### Build fails?

- Check `apps/web/next.config.ts` exists
- Ensure `"packageManager": "pnpm@10.0.0"` in root `package.json`

### Can't access API?

- Normal! Deploy backend first, then update `NEXT_PUBLIC_API_URL`

### Images not loading?

- Check Cloudinary credentials in Railway (after backend deployment)

---

## What's Next?

✅ Frontend deployed to Vercel

🔄 Next: Deploy backend to Railway
→ See `RAILWAY_SETUP.md` (coming next)

---

## Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Deployed Site**: Check Vercel dashboard for URL
- **GitHub Actions**: https://github.com/YOUR_USERNAME/whats-up-addis/actions
- **Documentation**: See `VERCEL_SETUP.md` for detailed guide

---

## Estimated Time

- Manual deployment: **5 minutes**
- With CI/CD setup: **10 minutes**
- Full stack (with Railway): **30 minutes**

You're on your way! 🚀

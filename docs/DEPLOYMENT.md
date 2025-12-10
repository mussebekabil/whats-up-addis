# Deployment Guide - What's Up Addis

This guide covers deploying the What's Up Addis application to Vercel (frontend) and Railway (backend).

## Architecture Overview

- **Frontend (Next.js)**: Deployed on Vercel
- **Backend (Express API)**: Deployed on Railway
- **Database (PostgreSQL)**: Hosted on Railway
- **Crawler**: Runs as a cron job on Railway
- **Images**: Cloudinary CDN

## Part 1: Deploy Frontend to Vercel

### Prerequisites
1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Push your code to GitHub

### Step 1: Connect Repository to Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository: `whats-up-addis`
4. Vercel will auto-detect Next.js

### Step 2: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && pnpm install && pnpm --filter @whats-up-addis/web build`
- **Output Directory**: `apps/web/.next` (auto-detected)
- **Install Command**: `pnpm install`

### Step 3: Set Environment Variables

In Vercel dashboard → Your Project → Settings → Environment Variables, add:

```bash
# API Backend URL (will be set after Railway deployment)
NEXT_PUBLIC_API_URL=https://your-railway-api-url.up.railway.app
```

**Note**: You'll update this after deploying the backend to Railway.

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for the build
3. Your app will be live at `https://your-app.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Part 2: Deploy Backend to Railway (Next Steps)

The backend deployment will be covered in the next phase. You'll deploy:
- Express API
- PostgreSQL database
- Crawler cron job

---

## Environment Variables Reference

### Frontend (.env for Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-api-url.up.railway.app
```

### Backend (.env for Railway)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# API
API_PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Crawler
CRAWLER_SCHEDULE="0 */6 * * *"
CRAWLER_USER_AGENT="WhatsUpAddis/1.0"
```

---

## Troubleshooting

### Build Fails on Vercel

**Error**: "Cannot find module '@whats-up-addis/shared'"
- **Solution**: Ensure `transpilePackages: ['@whats-up-addis/shared']` is in `next.config.ts`

**Error**: "Module not found: Can't resolve './types/index.js'"
- **Solution**: Verify webpack `extensionAlias` configuration in `next.config.ts`

### API Connection Issues

**Error**: "Failed to fetch" or CORS errors
- **Solution**:
  1. Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
  2. Ensure Railway API has CORS enabled
  3. Check that Railway API is running

---

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] Environment variables set
- [ ] Backend deployed to Railway (next phase)
- [ ] Database migrations run
- [ ] API health check passes
- [ ] Test user registration/login
- [ ] Test event creation
- [ ] Test image upload to Cloudinary
- [ ] Crawler cron job configured

---

## Next Steps

After deploying the frontend:
1. Deploy backend to Railway
2. Set up PostgreSQL on Railway
3. Run database migrations
4. Configure crawler cron job
5. Update `NEXT_PUBLIC_API_URL` in Vercel

Continue with Railway deployment guide for backend setup.

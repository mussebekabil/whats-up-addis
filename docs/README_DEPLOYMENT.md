# What's Up Addis - Deployment Overview

Complete deployment guide for the What's Up Addis event discovery platform.

## 📋 Deployment Strategy

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Frontend (Next.js)  →  Vercel  →  Edge CDN       │
│       ↓                                             │
│  API (Express)       →  Railway →  PostgreSQL      │
│  Crawler (Node)      →  Railway →  Cron Jobs       │
│       ↓                                             │
│  Images              →  Cloudinary CDN             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Cost Breakdown (Monthly)

| Service                | Free Tier      | Paid (Starter) |
| ---------------------- | -------------- | -------------- |
| Vercel (Frontend)      | ✅ FREE        | FREE           |
| Railway (Backend + DB) | $5 credit      | $5-15          |
| Cloudinary (Images)    | ✅ FREE (25GB) | $0             |
| **Total**              | **$0-5**       | **$5-15**      |

---

## 🚀 Quick Start

### Prerequisites

- ✅ Node.js 22+
- ✅ pnpm 10+
- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ Railway account (sign up: https://railway.app)
- ✅ Cloudinary account (free)

### Deployment Steps

#### Phase 1: Frontend to Vercel ⚡

**Time: 5-10 minutes**

1. **Push code to GitHub**

   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit: https://vercel.com/new
   - Import repository
   - Set root directory: `apps/web`
   - Add environment: `NEXT_PUBLIC_API_URL=http://localhost:3001`
   - Click Deploy

3. **Result**: Frontend live at `https://your-app.vercel.app` ✅

**Detailed Guide**: [`VERCEL_SETUP.md`](./VERCEL_SETUP.md)
**Quick Reference**: [`QUICK_DEPLOY.md`](./QUICK_DEPLOY.md)

---

#### Phase 2: Backend to Railway 🚂

**Time: 15-20 minutes**

Coming next! Will deploy:

- Express API
- PostgreSQL database
- Crawler with cron jobs

**Guide**: `RAILWAY_SETUP.md` (to be created)

---

## 📁 Deployment Files

### Configuration Files

```
whats-up-addis/
├── vercel.json                    # Vercel configuration
├── .vercelignore                  # Files to ignore for Vercel
├── apps/web/next.config.ts        # Next.js config with optimizations
├── .github/workflows/deploy.yml   # CI/CD workflow
├── DEPLOYMENT.md                  # Full deployment guide
├── VERCEL_SETUP.md               # Vercel detailed setup
├── QUICK_DEPLOY.md               # Quick reference
└── README_DEPLOYMENT.md          # This file
```

### Environment Files

```
.env                  # Local development (not committed)
.env.example          # Template for environment variables
apps/web/.env.local   # Next.js local env (not committed)
```

---

## 🔐 Environment Variables

### Frontend (Vercel)

```bash
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

### Backend (Railway - to be configured)

```bash
# Database
DATABASE_URL=postgresql://...

# API
API_PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-key
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

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Automatic deployment on every push to `main`:

```yaml
Workflow Steps:
1. Code Quality Check (Lint + Type Check)
2. Build Frontend
3. Build Backend
4. Deploy to Vercel (Production)
5. Deploy Preview (for PRs)
```

**Setup**:

1. Add GitHub secrets (see `VERCEL_SETUP.md`)
2. Push to main branch
3. Check Actions tab for status

---

## 📊 Monitoring & Logs

### Vercel

- **Dashboard**: https://vercel.com/dashboard
- **Analytics**: Built-in (Real-time visitor stats)
- **Logs**: Deployment logs in dashboard

### Railway (after deployment)

- **Dashboard**: https://railway.app/dashboard
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Network usage

---

## 🔧 Post-Deployment Tasks

### After Frontend Deployment ✅

- [ ] Verify site loads at Vercel URL
- [ ] Check homepage renders correctly
- [ ] Test dark mode toggle
- [ ] Verify images from Cloudinary load (if any static images)

### After Backend Deployment (Next Phase)

- [ ] Run database migrations
- [ ] Seed initial data (categories)
- [ ] Test API health endpoint
- [ ] Update `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Test user registration
- [ ] Test event creation
- [ ] Test image upload
- [ ] Configure crawler cron job
- [ ] Set up database backups

---

## 🐛 Troubleshooting

### Common Issues

**Build fails on Vercel**

- Check Node.js version in `package.json` engines
- Verify `transpilePackages` in `next.config.ts`
- Clear Vercel build cache

**API connection fails**

- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Check CORS settings in backend
- Ensure Railway API is running

**Images don't load**

- Check Cloudinary credentials in Railway
- Verify image URLs in database

**Full troubleshooting**: See `VERCEL_SETUP.md` and `RAILWAY_SETUP.md`

---

## 📚 Documentation Index

| Document           | Purpose               | When to Use                |
| ------------------ | --------------------- | -------------------------- |
| `QUICK_DEPLOY.md`  | Quick reference       | First-time deployment      |
| `VERCEL_SETUP.md`  | Detailed Vercel guide | Setup + troubleshooting    |
| `RAILWAY_SETUP.md` | Railway deployment    | Backend setup (next phase) |
| `DEPLOYMENT.md`    | Complete overview     | Reference for all services |
| `.env.example`     | Environment template  | Setting up environments    |

---

## 🎯 Current Status

### ✅ Completed

- [x] Vercel configuration files created
- [x] GitHub Actions workflow configured
- [x] Next.js optimized for production
- [x] Deployment documentation written
- [x] Quick reference guides created

### 🔄 Next Steps

1. Deploy frontend to Vercel (you can do this now!)
2. Create Railway setup guide
3. Deploy backend and database to Railway
4. Configure crawler cron jobs
5. Set up database backups
6. Configure monitoring and alerts

---

## 📞 Support

- **Vercel Issues**: https://vercel.com/support
- **Railway Issues**: https://railway.app/help
- **Project Issues**: GitHub Issues

---

## 🚀 Ready to Deploy?

Start with: **[`QUICK_DEPLOY.md`](./QUICK_DEPLOY.md)**

Or detailed guide: **[`VERCEL_SETUP.md`](./VERCEL_SETUP.md)**

---

**Happy Deploying! 🎉**

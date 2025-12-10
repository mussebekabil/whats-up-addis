# Fix Vercel Deployment Error

## The Error
```
Error: No Output Directory named "public" found after the Build completed.
```

## Solution

Delete `vercel.json` and configure through Vercel dashboard instead. Here's the correct setup:

### Step 1: Configure in Vercel Dashboard

Go to your project → **Settings** → **General** and set:

#### Build & Development Settings

**Framework Preset**: `Next.js`

**Root Directory**: `apps/web` ← **IMPORTANT**

**Build Command**: Leave as default (Vercel auto-detects)
- Or explicitly set: `pnpm build`

**Output Directory**: Leave as default (`.next`)

**Install Command**: `pnpm install` (auto-detected from packageManager)

**Node.js Version**: `22.x`

### Step 2: Environment Variables

Settings → **Environment Variables** → Add:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

(Update this after deploying backend)

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click on the failed deployment
3. Click **"Redeploy"** button (three dots menu)
4. Or push a new commit:
   ```bash
   git add .
   git commit -m "Fix Vercel configuration"
   git push origin main
   ```

---

## Alternative: Using Vercel CLI

If you prefer CLI deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project root
cd /Users/alemum/Documents/projects/whats-up-addis

# Deploy (will prompt for configuration)
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No (or Yes if you already created one)
# - What's your project's name? whats-up-addis
# - In which directory is your code located? apps/web
# - Want to override settings? No

# For production deployment
vercel --prod
```

---

## Why This Works

Vercel needs to know that your Next.js app is in `apps/web`, not at the root. By setting the **Root Directory** to `apps/web`, Vercel will:

1. Look for `package.json` in `apps/web`
2. Run build commands from `apps/web` context
3. Find the `.next` output directory in `apps/web/.next`
4. Serve the app correctly

---

## Verification

After redeploying, you should see:

✅ Build completes successfully
✅ Output: "Build completed. Deploying..."
✅ Site is live at your Vercel URL

---

## If You Still Have Issues

### Check pnpm Workspace Configuration

Ensure `package.json` at root has:

```json
{
  "packageManager": "pnpm@10.0.0"
}
```

### Check apps/web/package.json

Should have:

```json
{
  "name": "@whats-up-addis/web",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

### Clear Vercel Cache

In deployment settings:
1. Click three dots menu on failed deployment
2. Select "Redeploy"
3. Check "Clear build cache"

---

## Expected Build Output

```
✓ Creating an optimized production build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Build Completed in XXs
```

---

Push this fix and redeploy! 🚀

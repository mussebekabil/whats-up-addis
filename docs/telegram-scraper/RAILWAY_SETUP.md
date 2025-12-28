# Railway Deployment Setup for Telegram Scraper

This guide explains how to deploy the Telegram scraper to Railway without requiring interactive CLI input.

## Problem

The Telegram client requires authentication (phone number, verification code, and password) during connection. Railway and most cloud platforms don't support interactive terminal input during deployment or runtime.

## Solution

Use a pre-generated session string stored as an environment variable. The session string contains your authenticated credentials and allows the app to connect without prompts.

## Setup Steps

### 1. Generate Session String Locally

First, ensure you have your Telegram API credentials in your `.env` file:

```env
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
```

Run the session generator script:

```bash
pnpm --filter @whats-up-addis/telegram-scraper generate-session
```

This script will:

1. Prompt you for your phone number (with country code, e.g., +1234567890)
2. Send a verification code to your Telegram app
3. Ask for the verification code
4. Ask for your 2FA password (if enabled)
5. Generate and display your session string

**Example output:**

```
============================================================
✓ Authentication Successful!
============================================================

Authenticated as: John Doe

------------------------------------------------------------
Your Session String:
------------------------------------------------------------
1AgAOMTQ5LjE1NC4xNjcuNTABu+wVg...
------------------------------------------------------------

⚠️  IMPORTANT: Keep this session string secure!
```

### 2. Copy the Session String

Copy the entire session string from the terminal output. It's a long string of characters.

### 3. Add to Railway Environment Variables

1. Go to your Railway project dashboard
2. Select your service
3. Navigate to the **Variables** tab
4. Add a new variable:
   - **Name**: `TELEGRAM_SESSION_STRING`
   - **Value**: [paste your session string]

Also ensure these variables are set:

- `TELEGRAM_API_ID`: Your Telegram API ID
- `TELEGRAM_API_HASH`: Your Telegram API hash

### 4. Deploy

Once the environment variable is set, deploy or redeploy your application. The app will now:

- Use the session string from the environment variable
- Connect to Telegram without any interactive prompts
- Work seamlessly in Railway's non-interactive environment

## How It Works

The modified [telegram-client.service.ts](src/services/telegram-client.service.ts) now:

1. **Checks for session string** in this order:
   - Environment variable `TELEGRAM_SESSION_STRING` (Railway)
   - Local file `.telegram-session` (local development)

2. **Connects differently** based on available session:
   - **With session**: Connects directly using `client.connect()` (no prompts)
   - **Without session**: Uses interactive prompts (local development only)

## Local Development

For local development, you have two options:

### Option A: Interactive Authentication (Recommended for first time)

Just run your app normally:

```bash
pnpm --filter @whats-up-addis/telegram-scraper dev
```

On first run, it will prompt you for credentials and save the session to `.telegram-session` file.

### Option B: Use Session String

Set `TELEGRAM_SESSION_STRING` in your `.env` file and the app will use it instead of prompting.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit** the session string to version control
2. **Never share** your session string publicly
3. **Treat it like a password** - anyone with this string can access your Telegram account
4. **Regenerate if compromised** by deleting the session and running `generate-session` again
5. **Add to .gitignore**:
   ```
   .telegram-session
   ```

## Troubleshooting

### "Failed to connect to Telegram"

- Verify `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` are correct
- Check if session string is properly set in Railway
- Session might be expired - generate a new one

### "Authentication error"

- Your session might be invalid or expired
- Generate a new session string using the script
- Update the Railway environment variable with the new session

### Session Expiration

Telegram sessions can expire if:

- You log out from another device
- You revoke the session in Telegram settings
- The session is inactive for a very long time

If this happens, simply generate a new session string and update Railway.

## Alternative Solution (Not Recommended)

Another approach would be to use Railway's terminal feature to run the authentication interactively once, but this is:

- More complex to set up
- Requires manual intervention during deployment
- Not reproducible across deployments

The session string approach is cleaner and more maintainable.

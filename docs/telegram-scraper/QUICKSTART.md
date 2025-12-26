# Telegram Scraper - Quick Start Checklist

Use this checklist to get the Telegram scraper up and running quickly.

## Prerequisites Checklist

- [ ] Node.js 22+ installed
- [ ] pnpm 10+ installed
- [ ] PostgreSQL database running
- [ ] Database migrations applied (`pnpm db:migrate`)

## Setup Checklist

### 1. Create Telegram Bot

- [ ] Open Telegram app
- [ ] Search for and message [@BotFather](https://t.me/BotFather)
- [ ] Send `/newbot` command
- [ ] Choose a name for your bot
- [ ] Choose a username for your bot (must end in 'bot')
- [ ] Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
- [ ] Save token to `.env` file as `TELEGRAM_BOT_TOKEN`

### 2. Get Anthropic API Key

- [ ] Go to [https://console.anthropic.com/](https://console.anthropic.com/)
- [ ] Sign up or log in
- [ ] Navigate to API Keys section
- [ ] Click "Create Key"
- [ ] Copy the API key (starts with `sk-ant-`)
- [ ] Save to `.env` file as `ANTHROPIC_API_KEY`
- [ ] Add credits to your account if needed

### 3. Get Cloudinary Credentials

- [ ] Go to [https://cloudinary.com/console](https://cloudinary.com/console)
- [ ] Sign up or log in
- [ ] Copy Cloud Name from dashboard
- [ ] Copy API Key from dashboard
- [ ] Copy API Secret from dashboard
- [ ] Save all three to `.env` file

### 4. Configure Environment

Add these to your root `.env` file:

```env
# Required
TELEGRAM_BOT_TOKEN=your_bot_token_here
ANTHROPIC_API_KEY=your_anthropic_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
DATABASE_URL=postgresql://user:pass@localhost:5432/whats_up_addis

# Optional (defaults shown)
TELEGRAM_SCRAPER_MODE=listen
TELEGRAM_CRAWLER_SCHEDULE="0 */2 * * *"
```

- [ ] All environment variables set
- [ ] `.env` file saved

### 5. Install Dependencies

```bash
pnpm install
```

- [ ] Dependencies installed successfully

### 6. Add Telegram Sources

Option A: Using SQL

```sql
-- Get a category ID first
SELECT id, name FROM categories;

-- Add your Telegram channel/group
INSERT INTO telegram_sources (id, name, chat_id, chat_type, is_active, category_id)
VALUES (
  gen_random_uuid(),
  'Events Addis',           -- Your channel name
  '@eventsaddis',            -- Channel username or numeric ID
  'channel',                 -- 'channel', 'group', or 'supergroup'
  true,
  '<category-id-from-above>' -- or NULL
);
```

- [ ] At least one source added to database

Option B: Add bot to channel first to get chat ID

- [ ] Add your bot to the test channel (as admin for channels)
- [ ] Run `pnpm telegram:dev`
- [ ] Send a test message in the channel
- [ ] Check logs for chat ID
- [ ] Add source to database with correct chat ID

### 7. Test the Service

```bash
pnpm telegram:dev
```

- [ ] Service starts without errors
- [ ] Bot connects successfully
- [ ] See message: "Connected to Telegram as @your_bot_name"
- [ ] See message: "Listening to X Telegram sources"

### 8. Post Test Message

Post this in your test channel:

```
🎉 Test Event 🎉

Join us for an amazing test event!

Date: December 25, 2025
Time: 6:00 PM
Location: Unity Park, Addis Ababa
Price: 200 ETB

Don't miss out!
```

- [ ] Message posted in channel
- [ ] Bot processes the message (check logs)
- [ ] Event created in database

### 9. Verify Event Created

```sql
SELECT id, title, start_date, source, source_url, image_url
FROM events
WHERE source = 'telegram'
ORDER BY created_at DESC
LIMIT 5;
```

- [ ] Event appears in database
- [ ] Title matches test event
- [ ] Date is correct
- [ ] Source is 'telegram'
- [ ] Source URL points to Telegram message

## Troubleshooting Quick Checks

### Bot Not Receiving Messages?

- [ ] Bot added to channel/group?
- [ ] Bot is admin (for channels)?
- [ ] Correct `chat_id` in database?
- [ ] Source `is_active = true`?
- [ ] Check bot token is correct

### Events Not Being Created?

- [ ] Check logs for parsing errors
- [ ] Anthropic API key valid?
- [ ] API credits available?
- [ ] Message contains clear event information?
- [ ] Database connection working?

### Images Not Uploading?

- [ ] Cloudinary credentials correct?
- [ ] Cloudinary quota not exceeded?
- [ ] Network connectivity OK?
- [ ] Check logs for specific error

## Production Deployment Checklist

- [ ] All environment variables set in production
- [ ] Database migrations applied
- [ ] At least one production source added
- [ ] Service runs without errors
- [ ] Set up process manager (PM2, Docker, systemd)
- [ ] Configure monitoring/alerting
- [ ] Monitor API costs (Anthropic)
- [ ] Set up log aggregation
- [ ] Document recovery procedures

## Monitoring Checklist

Daily checks:

- [ ] Service is running
- [ ] No critical errors in logs
- [ ] Events being created
- [ ] API costs within budget

Weekly checks:

- [ ] Review event quality
- [ ] Check duplicate detection working
- [ ] Monitor image upload success rate
- [ ] Review LLM parsing accuracy

Monthly checks:

- [ ] Review and adjust LLM prompts
- [ ] Optimize API costs
- [ ] Add/remove sources as needed
- [ ] Update documentation

## Quick Commands Reference

```bash
# Development
pnpm telegram:dev

# Run once (test)
pnpm telegram:scrape

# Type check
pnpm --filter @whats-up-addis/telegram-scraper type-check

# Build
pnpm --filter @whats-up-addis/telegram-scraper build

# Production start
pnpm --filter @whats-up-addis/telegram-scraper start

# Database
pnpm db:migrate      # Run migrations
pnpm db:studio       # Open Prisma Studio
pnpm db:generate     # Regenerate Prisma client
```

## Success Indicators

You'll know everything is working when:

- ✅ Bot connects without errors
- ✅ Messages are received and logged
- ✅ Events appear in database
- ✅ Images uploaded to Cloudinary
- ✅ No critical errors in logs
- ✅ Duplicate events are skipped
- ✅ Statistics show in logs

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- See [docs/telegram-scraper-setup-guide.md](../../docs/telegram-scraper-setup-guide.md) for step-by-step setup
- Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details
- Check logs for specific error messages

---

**Ready to go?** Run `pnpm telegram:dev` and watch the magic happen! ✨

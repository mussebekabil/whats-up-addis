# Telegram Events Scraper

A microservice that listens to Telegram channels/groups, extracts event information using LLM, and publishes events to the database.

## Features

- 🤖 **AI-Powered Parsing** - Event information extraction using Anthropic Claude LLM
- 📂 **Smart Categorization** - Automatically categorizes events using LLM based on content
- 📸 **Media Support** - Downloads and uploads both images and videos to Cloudinary
- 🔄 **Real-time Listening** - Real-time message listening from Telegram channels/groups
- 🌍 **Multi-language** - Handles English, Amharic, and mixed-language posts
- 🔍 **Duplicate Detection** - Smart duplicate event detection
- 📅 **Multiple Operation Modes** - Listen, cron, or once modes
- ⚡ **Comprehensive Error Handling** - Graceful error handling and detailed logging

## Architecture

The service consists of four main components:

1. **TelegramClientService** - Manages Telegram bot connection and message fetching
2. **LLMParserService** - Extracts structured event data from text using Claude
3. **ImageUploadService** - Handles image upload to Cloudinary
4. **TelegramCrawlerService** - Orchestrates the entire pipeline

## Setup

### 1. Get Telegram API Credentials

**This scraper uses your personal Telegram account (not a bot), so you can read messages from any group you're a member of, including private groups.**

1. Go to [https://my.telegram.org/apps](https://my.telegram.org/apps)
2. Login with your phone number
3. Click "API development tools"
4. Create a new application (use any name)
5. Copy your `api_id` and `api_hash`

**Why this approach?**

- ✅ Works with private groups you're a member of
- ✅ No admin permissions needed
- ✅ Access to full message history
- ✅ No need to add a bot to groups

### 2. Configure Environment Variables

Copy `.env.example` to the root `.env` file and fill in the values:

```bash
cp apps/telegram-scraper/.env.example .env
```

Required environment variables:

- `TELEGRAM_API_ID` - Your API ID from my.telegram.org
- `TELEGRAM_API_HASH` - Your API hash from my.telegram.org
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Your Cloudinary credentials
- `DATABASE_URL` - PostgreSQL connection string

**Note:** On first run, you'll be prompted to enter your phone number and verification code to authenticate your Telegram account.

### 3. Add Telegram Sources

Add Telegram channels/groups to monitor in the database:

```sql
INSERT INTO telegram_sources (id, name, chat_id, chat_type, is_active, category_id)
VALUES (
  gen_random_uuid(),
  'Events Addis',
  '@eventsaddis',  -- or numeric chat ID
  'channel',       -- or 'group', 'supergroup'
  true,
  '<category-id>'
);
```

## Usage

### Development Mode

Run the scraper in development with auto-reload:

```bash
pnpm --filter @whats-up-addis/telegram-scraper dev
```

### Production Modes

#### Listen Mode (Recommended)

Real-time listening for new messages:

```bash
TELEGRAM_SCRAPER_MODE=listen pnpm --filter @whats-up-addis/telegram-scraper start
```

#### Cron Mode

Scheduled crawling at specified intervals:

```bash
TELEGRAM_SCRAPER_MODE=cron TELEGRAM_CRAWLER_SCHEDULE="0 */2 * * *" pnpm --filter @whats-up-addis/telegram-scraper start
```

#### Once Mode

Run once and exit (useful for testing):

```bash
TELEGRAM_SCRAPER_MODE=once pnpm --filter @whats-up-addis/telegram-scraper scrape
```

## Operation Modes

### Listen Mode (Default)

- Bot stays connected and listens for new messages in real-time
- Processes messages immediately as they arrive
- Recommended for production use
- Automatically reconnects on connection loss

### Cron Mode

- Runs on a schedule (default: every 2 hours)
- Fetches historical messages since last crawl
- Useful when real-time processing is not required
- More suitable for rate-limited scenarios

### Once Mode

- Runs a single crawl and exits
- Useful for manual triggers or testing
- Can be used in CI/CD pipelines

## Message Processing Pipeline

1. **Fetch Message** - Receive message from Telegram
2. **Text Extraction** - Extract text content from message
3. **LLM Parsing** - Send text to Claude for event extraction
4. **Validation** - Validate extracted event data
5. **Duplicate Check** - Check if event already exists
6. **Image Upload** - Download and upload images to Cloudinary
7. **Database Insert** - Create event record with tags
8. **Update Source** - Update last processed message ID

## Event Extraction

The LLM parser extracts the following information:

- **title** - Event name (required, max 255 chars)
- **description** - Full event description (required)
- **location** - Physical address (optional)
- **venue** - Venue name (optional)
- **startDate** - Start date/time in ISO 8601 format (required)
- **endDate** - End date/time (optional)
- **price** - Ticket price as number (optional)
- **tags** - Array of relevant keywords (optional)
- **categoryId** - Auto-determined event category (optional)

## Category Resolution

The LLM automatically categorizes events based on content:

**Available Categories:**

- Music & Concerts
- Sports & Fitness
- Arts & Culture
- Food & Drink
- Business & Professional
- Community & Social
- Education & Learning
- Technology

**Fallback Order:**

1. LLM-determined category (AI analyzes event content)
2. Source's default category (if configured)
3. "Uncategorized" category

## Media Handling

The scraper supports both images and videos:

**Images:**

- Resized to 1200x1200 (aspect ratio preserved)
- Optimized quality (auto:good)
- Automatic format conversion
- Uploaded to Cloudinary

**Videos:**

- Resized to 1920x1080 (aspect ratio preserved)
- Optimized quality (auto:good)
- Automatic format conversion
- Progress logging with file size
- Uploaded to Cloudinary

Both media types are stored in the database with their Cloudinary URLs (`imageUrl` and `videoUrl` fields).

## Error Handling

The service handles errors gracefully:

- **Telegram API Errors** - Logged and retried
- **LLM Parsing Errors** - Message skipped, processing continues
- **Image Upload Errors** - Event saved without image
- **Database Errors** - Logged and retried once

## Monitoring

The service provides detailed logging:

- Connection status
- Messages processed per source
- Events created
- Errors with type and description
- Processing statistics

## Database Schema

The service uses the `telegram_sources` table to track Telegram channels/groups:

- `id` - Unique identifier
- `name` - Display name
- `chat_id` - Telegram chat ID or username (@channel)
- `chat_type` - Type: 'channel', 'group', or 'supergroup'
- `is_active` - Whether to process messages from this source
- `last_message_id` - Last processed message ID
- `last_crawled_at` - Timestamp of last crawl
- `category_id` - Default category for events from this source

## Docker Deployment

### Building the Image

```bash
# From the project root
docker build -f apps/telegram-scraper/Dockerfile -t telegram-scraper .
```

### Running with Docker

```bash
docker run -d \
  --name telegram-scraper \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e TELEGRAM_API_ID="your_api_id" \
  -e TELEGRAM_API_HASH="your_api_hash" \
  -e ANTHROPIC_API_KEY="your_key" \
  -e CLOUDINARY_CLOUD_NAME="your_cloud" \
  -e CLOUDINARY_API_KEY="your_key" \
  -e CLOUDINARY_API_SECRET="your_secret" \
  -e TELEGRAM_SCRAPER_MODE="listen" \
  telegram-scraper
```

### Railway Deployment

Railway doesn't support interactive terminal input, so you need to pre-generate a session string.

#### Step 1: Generate Session String Locally

```bash
pnpm --filter @whats-up-addis/telegram-scraper generate-session
```

This will:

- Prompt for your phone number, verification code, and 2FA password
- Generate a session string
- Display the session string for you to copy

**IMPORTANT:** This session will be used ONLY for Railway. Don't use the same session locally to avoid `AUTH_KEY_DUPLICATED` errors.

#### Step 2: Deploy to Railway

1. Create a new service on Railway
2. Connect your GitHub repository
3. Railway will automatically detect the Dockerfile
4. Set environment variables in Railway dashboard:
   - `TELEGRAM_API_ID` - Your API ID
   - `TELEGRAM_API_HASH` - Your API hash
   - `TELEGRAM_SESSION_STRING` - **The session string from step 1**
   - `ANTHROPIC_API_KEY` - Your Anthropic key
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary secret
   - `DATABASE_URL` - PostgreSQL connection (connect to Railway PostgreSQL)
   - `TELEGRAM_SCRAPER_MODE=listen` - Operation mode

5. Deploy!

#### Step 3: For Local Development

For local development, use a SEPARATE session:

```bash
# Don't set TELEGRAM_SESSION_STRING in your .env file
# Let the app prompt you interactively and save to .telegram-session file
pnpm --filter @whats-up-addis/telegram-scraper dev
```

This keeps your Railway and local sessions separate, preventing conflicts.

## Reset and Re-process

To clear all telegram events and re-process messages:

```bash
pnpm --filter @whats-up-addis/telegram-scraper reset
```

This is useful when:

- Testing new category resolution logic
- Updating event parsing rules
- Fixing data issues

## Limitations

- First-time authentication must be done locally (requires phone verification)
- Large videos may take time to upload depending on network speed
- Historical message fetching works best in listen mode for real-time processing

## Future Enhancements

- Vision-based event extraction (analyze event posters/flyers)
- Semantic similarity for better duplicate detection
- Event verification and quality scoring
- Admin API endpoints for managing sources
- Support for multiple languages in LLM prompts

## Troubleshooting

### ❌ "406: AUTH_KEY_DUPLICATED" Error

**This is the most common deployment error!**

**Cause:** You're using the same Telegram session in multiple places at once (both locally and on Railway).

**Solution:**

1. **Delete your local session file:**

   ```bash
   rm apps/telegram-scraper/.telegram-session
   ```

2. **Generate a NEW session for Railway:**

   ```bash
   pnpm --filter @whats-up-addis/telegram-scraper generate-session
   ```

3. **Copy the session string** and add it to Railway as `TELEGRAM_SESSION_STRING`

4. **Important:**
   - Use this session ONLY on Railway
   - For local dev, don't set `TELEGRAM_SESSION_STRING` in `.env`
   - Let your local instance authenticate separately (it will prompt you)

**Why this happens:** Telegram only allows ONE active connection per session. If you use the same session locally and on Railway simultaneously, they conflict.

### Not Receiving Messages

1. Ensure you're a member of the channel/group
2. Check that `chat_id` in database matches the actual chat ID
3. For private groups, use the numeric chat ID (e.g., `-1001234567890`)
4. Verify `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` are correct
5. Check that your session is authenticated

### "Failed to connect to Telegram"

1. Verify `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` are correct
2. Check if `TELEGRAM_SESSION_STRING` is set correctly in Railway
3. Session might be expired - generate a new one
4. Make sure the session isn't being used elsewhere (AUTH_KEY_DUPLICATED)

### LLM Parsing Failures

1. Check `ANTHROPIC_API_KEY` is valid
2. Verify API key has sufficient credits
3. Check message text is in supported language
4. Review LLM prompt in `llm-parser.service.ts`

### Image Upload Failures

1. Verify Cloudinary credentials
2. Check network connectivity
3. Ensure sufficient Cloudinary storage quota
4. Review image size and format

## License

Private - Part of Whats Up Addis platform

# Telegram Events Scraper

A microservice that listens to Telegram channels/groups, extracts event information using LLM, and publishes events to the database.

## Features

- Real-time message listening from Telegram channels/groups
- Event information extraction using Anthropic Claude LLM
- Automatic image upload to Cloudinary
- Duplicate event detection
- Multiple operation modes (listen, cron, once)
- Comprehensive error handling and logging

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

## Limitations

- Historical message fetching requires MTProto client (not implemented)
- Current implementation works best with listen mode for new messages
- For channels, the bot must be added as an admin to receive messages

## Future Enhancements

- Support for MTProto client for better historical message fetching
- Multi-language support improvements
- Image-based event extraction using vision models
- Semantic similarity for better duplicate detection
- Event verification and quality scoring
- Admin API endpoints for managing sources

## Troubleshooting

### Not Receiving Messages

1. Ensure you're a member of the channel/group
2. Check that `chat_id` in database matches the actual chat ID
3. For private groups, use the numeric chat ID (e.g., `-1001234567890`)
4. Verify `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` are correct
5. Check that your session is authenticated (`.telegram-session` file exists)

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

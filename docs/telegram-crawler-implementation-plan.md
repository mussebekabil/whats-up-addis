# Telegram Events Crawler Implementation Plan

## Overview
This document outlines the implementation plan for a new microservice that fetches event posts from Telegram groups, processes them using an LLM to extract structured data, uploads images to Cloudinary, and stores the events in the PostgreSQL database.

## Architecture

### System Components
1. **Telegram Bot/Client** - Connects to Telegram groups and fetches messages
2. **LLM Parser Service** - Processes text messages to extract event information
3. **Image Processing Service** - Downloads and uploads images to Cloudinary
4. **Database Service** - Stores processed events in PostgreSQL
5. **Scheduler** - Runs the crawler periodically (similar to existing crawler)

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Telegram Client**: `telegraf` or `telegram` (node-telegram-bot-api)
- **LLM Integration**: OpenAI API or Anthropic Claude API
- **Image Upload**: Cloudinary SDK (already used in the API)
- **Database**: Prisma ORM (already configured)
- **Job Scheduling**: node-cron (already used in crawler)
- **Environment**: Integrated into existing `apps/crawler` service

## Database Schema Updates

### New Model: TelegramSource
```prisma
model TelegramSource {
  id                String    @id @default(uuid())
  name              String    @db.VarChar(255)        // Display name for the source
  chatId            String    @unique @map("chat_id") @db.VarChar(255) // Telegram chat ID or username
  chatType          String    @map("chat_type") @db.VarChar(50)        // "channel", "group", "supergroup"
  isActive          Boolean   @default(true) @map("is_active")
  lastMessageId     Int?      @map("last_message_id")                  // Track last processed message
  lastCrawledAt     DateTime? @map("last_crawled_at")
  categoryId        String?   @map("category_id")                      // Default category for events
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  category  Category? @relation(fields: [categoryId], references: [id])

  @@map("telegram_sources")
}
```

### Updates to Event Model
The existing `Event` model already supports:
- `source` field - will use "telegram" as value
- `sourceUrl` field - will store the Telegram message link
- `imageUrl` field - will store Cloudinary URL
- `categoryId` field - linked to category

## Implementation Steps

### Phase 1: Setup and Configuration

#### 1.1 Install Dependencies
```bash
pnpm --filter @whats-up-addis/crawler add telegraf
pnpm --filter @whats-up-addis/crawler add openai
# OR
pnpm --filter @whats-up-addis/crawler add @anthropic-ai/sdk
```

#### 1.2 Environment Variables
Add to `.env` file:
```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash

# LLM Configuration (choose one)
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key

# Cloudinary (already exists in API, may need to share)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Crawler Configuration
TELEGRAM_CRAWLER_ENABLED=true
TELEGRAM_CRAWLER_SCHEDULE="0 */2 * * *"  # Every 2 hours
```

#### 1.3 Database Migration
Create a new migration for the `TelegramSource` model:
```bash
pnpm db:generate
pnpm db:migrate
```

### Phase 2: Core Services Implementation

#### 2.1 Telegram Client Service
**File**: `apps/crawler/src/services/telegram-client.service.ts`

**Responsibilities**:
- Initialize Telegram bot/client connection
- Fetch messages from specified channels/groups
- Handle message pagination
- Extract message text and media
- Track last processed message ID

**Key Methods**:
```typescript
class TelegramClientService {
  async connect(): Promise<void>
  async fetchMessages(chatId: string, lastMessageId?: number): Promise<TelegramMessage[]>
  async downloadPhoto(photoId: string): Promise<Buffer>
  async getMessageLink(chatId: string, messageId: number): Promise<string>
}
```

#### 2.2 LLM Parser Service
**File**: `apps/crawler/src/services/llm-parser.service.ts`

**Responsibilities**:
- Send event text to LLM API
- Parse LLM response into structured event data
- Handle parsing errors and retries
- Validate extracted data

**Prompt Engineering**:
The LLM will receive a system prompt like:
```
You are an event information extractor. Parse the following event post and extract:
- title: The event name (required)
- description: Full event description (required)
- location: Physical location/address (optional)
- venue: Venue name (optional)
- startDate: Event start date and time in ISO format (required)
- endDate: Event end date and time in ISO format (optional)
- price: Ticket price as a number (optional, null for free events)
- tags: Array of relevant tags/keywords

Extract dates in various formats (Ethiopian/Gregorian calendar).
If information is missing, return null for that field.
Respond ONLY with valid JSON.
```

**Key Methods**:
```typescript
interface ParsedEventData {
  title: string;
  description: string;
  location?: string;
  venue?: string;
  startDate: string;
  endDate?: string;
  price?: number;
  tags?: string[];
}

class LLMParserService {
  async parseEventText(text: string): Promise<ParsedEventData>
  private validateParsedData(data: any): ParsedEventData
}
```

#### 2.3 Image Upload Service
**File**: `apps/crawler/src/services/image-upload.service.ts`

**Responsibilities**:
- Upload images to Cloudinary
- Handle image optimization
- Generate appropriate folder structure
- Return public URL

**Key Methods**:
```typescript
class ImageUploadService {
  async uploadFromBuffer(buffer: Buffer, filename: string): Promise<string>
  async uploadFromUrl(url: string): Promise<string>
  private generateFolder(source: string): string
}
```

#### 2.4 Telegram Crawler Service
**File**: `apps/crawler/src/services/telegram-crawler.service.ts`

**Responsibilities**:
- Orchestrate the entire crawling process
- Fetch active Telegram sources from database
- Process each message through the pipeline
- Handle deduplication
- Save events to database
- Update last crawled timestamp

**Processing Pipeline**:
```
1. Fetch active TelegramSources from database
2. For each source:
   a. Fetch new messages since lastMessageId
   b. For each message with text content:
      i. Parse text with LLM
      ii. Download and upload image if exists
      iii. Create event record in database
      iv. Update lastMessageId and lastCrawledAt
   c. Handle errors without stopping entire process
```

**Key Methods**:
```typescript
class TelegramCrawlerService {
  async crawlAll(): Promise<void>
  async crawlSource(source: TelegramSource): Promise<number>
  private async processMessage(message: TelegramMessage, source: TelegramSource): Promise<void>
  private async checkDuplicate(title: string, startDate: Date): Promise<boolean>
}
```

### Phase 3: Scraper Implementation

#### 3.1 Telegram Scraper
**File**: `apps/crawler/src/scrapers/telegram.scraper.ts`

Following the existing scraper pattern (similar to `alx.scraper.ts`):

```typescript
import { BaseScraper } from './base.scraper.js';

export class TelegramScraper extends BaseScraper {
  constructor() {
    super('telegram', 'https://t.me');
  }

  async scrape(): Promise<Event[]> {
    // Implementation using TelegramCrawlerService
  }
}
```

#### 3.2 Update Crawler Service
**File**: `apps/crawler/src/services/crawler.service.ts`

Add Telegram scraper to the crawler rotation:
```typescript
import { TelegramScraper } from '../scrapers/telegram.scraper.js';

// In crawlAll method, add:
const telegramScraper = new TelegramScraper();
await this.runScraper(telegramScraper);
```

### Phase 4: Error Handling and Logging

#### 4.1 Error Handling Strategy
- **Telegram API Errors**: Retry with exponential backoff
- **LLM Parsing Errors**: Log error, skip message, continue processing
- **Image Upload Errors**: Save event without image, log error
- **Database Errors**: Retry once, then log and skip

#### 4.2 Logging
```typescript
interface CrawlerLog {
  timestamp: DateTime;
  source: string;
  messagesProcessed: number;
  eventsCreated: number;
  errors: Array<{ type: string; message: string }>;
}
```

Log to console and optionally to a log file or monitoring service.

### Phase 5: Configuration and Management

#### 5.1 Admin Endpoints (API Service)
Add endpoints to manage Telegram sources:
```
POST   /api/admin/telegram-sources       - Create new source
GET    /api/admin/telegram-sources       - List all sources
PATCH  /api/admin/telegram-sources/:id   - Update source
DELETE /api/admin/telegram-sources/:id   - Delete source
POST   /api/admin/telegram-sources/:id/crawl - Manually trigger crawl
```

#### 5.2 Seed Data
**File**: `packages/database/prisma/seed.ts`

Add sample Telegram sources:
```typescript
await prisma.telegramSource.createMany({
  data: [
    {
      name: 'Events Addis',
      chatId: '@eventsaddis',
      chatType: 'channel',
      categoryId: defaultCategoryId,
    },
    // Add more channels
  ]
});
```

## Testing Strategy

### Unit Tests
- Test LLM parser with sample event texts
- Test image upload service with mock images
- Test date parsing for Ethiopian calendar
- Test deduplication logic

### Integration Tests
- Test full pipeline with mock Telegram messages
- Test database operations
- Test Cloudinary integration

### Manual Testing
1. Create test Telegram channel
2. Post sample event messages
3. Run crawler manually
4. Verify events appear in database
5. Check images uploaded to Cloudinary
6. Verify data accuracy

## LLM Prompt Examples

### System Prompt
```
You are an expert at extracting structured event information from text posts.
Extract event details from Telegram messages that may be in English, Amharic, or mixed languages.
Handle both Gregorian and Ethiopian calendar dates.

Rules:
- Title must be concise (max 255 characters)
- Description should include all relevant details
- Parse dates carefully, considering timezone (Africa/Addis_Ababa)
- Price should be a number (extract from "ETB 500", "500 birr", etc.)
- If date is relative ("tomorrow", "next week"), calculate actual date
- Return null for missing optional fields
- Always return valid JSON
```

### User Prompt Template
```
Extract event information from this Telegram post:

"""
{message_text}
"""

Current date: {current_date}
Timezone: Africa/Addis_Ababa

Return JSON with this structure:
{
  "title": "string (required)",
  "description": "string (required)",
  "location": "string or null",
  "venue": "string or null",
  "startDate": "ISO 8601 string (required)",
  "endDate": "ISO 8601 string or null",
  "price": number or null,
  "tags": ["string"] or []
}
```

### Example Input/Output

**Input:**
```
🎉 ADDIS MUSIC FESTIVAL 2024 🎉

Join us for the biggest music event of the year!
Date: December 25-26, 2024
Time: 6:00 PM onwards
Location: Meskel Square, Addis Ababa
Price: 500 ETB (Early Bird), 700 ETB (Regular)

Featuring top artists from Ethiopia and East Africa!

Get your tickets now: https://tickets.example.com
```

**LLM Output:**
```json
{
  "title": "Addis Music Festival 2024",
  "description": "Join us for the biggest music event of the year! Featuring top artists from Ethiopia and East Africa!",
  "location": "Meskel Square, Addis Ababa",
  "venue": "Meskel Square",
  "startDate": "2024-12-25T18:00:00+03:00",
  "endDate": "2024-12-26T23:59:59+03:00",
  "price": 500,
  "tags": ["music", "festival", "concert", "meskel-square"]
}
```

## Security Considerations

### Telegram Bot Security
- Store bot token securely in environment variables
- Use webhook instead of polling for production
- Validate incoming messages
- Rate limit processing

### LLM API Security
- Secure API keys
- Monitor API usage and costs
- Implement request timeouts
- Sanitize inputs before sending to LLM

### Data Validation
- Validate all dates (not in past, reasonable future limit)
- Sanitize text to prevent injection attacks
- Validate image sizes before upload
- Check for malicious content

## Performance Optimization

### Batch Processing
- Process multiple messages in parallel (with rate limiting)
- Batch database insertions
- Cache category lookups

### Rate Limiting
- Respect Telegram API rate limits (30 requests/second)
- Implement exponential backoff for retries
- Queue messages if rate limit exceeded

### Caching
- Cache LLM responses for similar messages
- Cache Cloudinary upload results
- Cache category mappings

## Monitoring and Observability

### Metrics to Track
- Messages processed per hour
- Events created per hour
- LLM API costs
- Image upload success rate
- Average processing time per message
- Error rates by type

### Alerts
- Telegram API connection failures
- LLM API errors exceeding threshold
- Database connection issues
- Image upload failures
- Unexpected data formats

## Deployment

### Environment-Specific Configuration
- **Development**: Manual trigger, verbose logging
- **Staging**: Hourly schedule, test Telegram channels
- **Production**: 2-hour schedule, production channels

### Rollout Strategy
1. Deploy with feature flag disabled
2. Add test Telegram sources
3. Test manually with small dataset
4. Enable for one production source
5. Monitor for 24 hours
6. Gradually add more sources

## Estimated Costs

### API Costs (Monthly)
- **Telegram API**: Free
- **OpenAI GPT-4**: ~$0.03/message × 10,000 messages = $300
- **Anthropic Claude 3**: ~$0.025/message × 10,000 messages = $250
- **Cloudinary**: Free tier (25GB storage, 25GB bandwidth)

### Optimization Options
- Use GPT-3.5 for simpler messages ($0.001/message)
- Implement caching to reduce LLM calls
- Compress images before upload

## Future Enhancements

### Phase 2 Features
1. **Smart Categorization**: Use LLM to auto-assign categories
2. **Image Analysis**: Use vision LLM to extract info from poster images
3. **Duplicate Detection**: Use semantic similarity for better deduplication
4. **Multi-language Support**: Better handling of Amharic text
5. **User Feedback Loop**: Allow users to correct parsed events
6. **Automatic Retries**: Retry failed messages after certain period
7. **Analytics Dashboard**: Visualize crawler performance and statistics

### Integration Opportunities
1. **Notification System**: Notify users of new events from their favorite sources
2. **Quality Scoring**: Rate event completeness and accuracy
3. **Source Reputation**: Track source reliability and accuracy
4. **Event Verification**: Flag events for manual review if confidence is low

## File Structure

```
apps/crawler/
├── src/
│   ├── services/
│   │   ├── telegram-client.service.ts       # Telegram API integration
│   │   ├── llm-parser.service.ts            # LLM text parsing
│   │   ├── image-upload.service.ts          # Cloudinary uploads
│   │   ├── telegram-crawler.service.ts      # Main orchestration
│   │   └── crawler.service.ts               # Updated to include Telegram
│   ├── scrapers/
│   │   └── telegram.scraper.ts              # Telegram scraper implementation
│   ├── utils/
│   │   ├── date-parser.util.ts              # Ethiopian/Gregorian date handling
│   │   └── text-sanitizer.util.ts           # Text cleaning utilities
│   └── types/
│       └── telegram.types.ts                # TypeScript interfaces
├── tests/
│   ├── unit/
│   │   ├── llm-parser.test.ts
│   │   └── date-parser.test.ts
│   └── integration/
│       └── telegram-crawler.test.ts
└── package.json

packages/database/
└── prisma/
    ├── migrations/
    │   └── YYYYMMDDHHMMSS_add_telegram_source/
    │       └── migration.sql
    └── schema.prisma                         # Updated with TelegramSource

apps/api/
└── src/
    └── routes/
        └── admin/
            └── telegram-sources.routes.ts    # Admin management endpoints
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Database schema design and migration
- [ ] Install dependencies
- [ ] Setup Telegram client service
- [ ] Basic message fetching

### Week 2: Core Features
- [ ] Implement LLM parser service
- [ ] Implement image upload service
- [ ] Build main crawler service
- [ ] Integration testing

### Week 3: Integration
- [ ] Integrate with existing crawler
- [ ] Admin API endpoints
- [ ] Error handling and logging
- [ ] Manual testing

### Week 4: Polish and Deploy
- [ ] Performance optimization
- [ ] Documentation
- [ ] Monitoring setup
- [ ] Production deployment

## Success Criteria

### MVP Requirements
- ✅ Successfully fetch messages from Telegram channels
- ✅ Parse at least 80% of event messages accurately
- ✅ Upload images to Cloudinary
- ✅ Store events in database with proper relationships
- ✅ Run on schedule without manual intervention
- ✅ Handle errors gracefully without crashing

### Performance Targets
- Process 100+ messages per hour
- LLM parsing accuracy > 80%
- Image upload success rate > 95%
- Zero critical errors per day
- Average processing time < 10 seconds per message

## References and Resources

### Documentation
- Telegram Bot API: https://core.telegram.org/bots/api
- Telegraf Framework: https://telegraf.js.org/
- OpenAI API: https://platform.openai.com/docs/api-reference
- Anthropic API: https://docs.anthropic.com/claude/reference
- Cloudinary Node.js: https://cloudinary.com/documentation/node_integration
- Prisma: https://www.prisma.io/docs/

### Similar Projects
- Event extraction from social media
- Automated content moderation
- News aggregation bots

---

**Document Version**: 1.0
**Last Updated**: 2024-12-11
**Author**: Technical Planning
**Status**: Ready for Implementation

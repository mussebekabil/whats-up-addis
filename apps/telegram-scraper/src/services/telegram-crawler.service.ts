import { PrismaClient, TelegramSource } from '@whats-up-addis/database';
import { EventStatus } from '@whats-up-addis/shared';
import { TelegramClientService } from './telegram-client.service.js';
import { LLMParserService } from './llm-parser.service.js';
import { ImageUploadService } from './image-upload.service.js';
import { TelegramMessage, CrawlerStats } from '../types/telegram.types.js';

export class TelegramCrawlerService {
  private prisma: PrismaClient;
  private telegramClient: TelegramClientService;
  private llmParser: LLMParserService;
  private imageUpload: ImageUploadService;
  private categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }> = [];

  constructor() {
    this.prisma = new PrismaClient();
    this.telegramClient = new TelegramClientService();
    this.llmParser = new LLMParserService();
    this.imageUpload = new ImageUploadService();
  }

  private async loadCategories(): Promise<void> {
    if (this.categories.length === 0) {
      this.categories = await this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      });
      console.log(
        `Loaded ${this.categories.length} categories for event classification`
      );
    }
  }

  async crawlAll(): Promise<CrawlerStats[]> {
    console.log('Starting Telegram crawler...');

    try {
      // Load categories for event classification
      await this.loadCategories();

      // Fetch all active Telegram sources
      const sources = await this.prisma.telegramSource.findMany({
        where: { isActive: true },
        include: { category: true },
      });

      console.log(`Found ${sources.length} active Telegram sources`);

      const stats: CrawlerStats[] = [];

      for (const source of sources) {
        try {
          const sourceStat = await this.crawlSource(source);
          stats.push(sourceStat);
        } catch (error) {
          console.error(`Failed to crawl source ${source.name}:`, error);
          stats.push({
            timestamp: new Date(),
            source: source.name,
            messagesProcessed: 0,
            eventsCreated: 0,
            errors: [
              {
                type: 'source_error',
                message:
                  error instanceof Error ? error.message : 'Unknown error',
              },
            ],
          });
        }

        // Encourage garbage collection between sources so memory used by
        // one source's messages/parsed data doesn't linger while the next
        // source is being crawled.
        if (global.gc) {
          global.gc();
        }
      }

      return stats;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async crawlSource(source: TelegramSource): Promise<CrawlerStats> {
    console.log(`Crawling source: ${source.name} (${source.chatId})`);

    const stats: CrawlerStats = {
      timestamp: new Date(),
      source: source.name,
      messagesProcessed: 0,
      eventsCreated: 0,
      errors: [],
    };

    try {
      // Limit the number of messages fetched per crawl cycle to avoid large memory spikes
      const crawlerBatchSize = parseInt(
        process.env.CRAWLER_BATCH_SIZE || '100',
        10
      );

      // Fetch new messages since last crawl
      const messages = await this.telegramClient.fetchMessages(
        source.chatId,
        source.lastMessageId || undefined,
        crawlerBatchSize
      );

      console.log(
        `Fetched ${messages.length} new messages from ${source.name}`
      );

      // Bulk-parse all messages with text in a single LLM call (or a few batched calls)
      const textMessages = messages.filter((m) => m.text);
      const parsedBatch =
        textMessages.length > 0
          ? await this.llmParser.parseEventsBatch(
              textMessages.map((m) => ({
                messageId: m.messageId,
                text: m.text!,
              })),
              this.categories
            )
          : new Map();
      // Free the intermediate text-only array now that parsing is done
      textMessages.length = 0;

      // Process messages in bounded chunks so the full message list never
      // needs to be fully "in flight" at once, keeping memory usage low.
      const processingBatchSize = 50;
      for (let i = 0; i < messages.length; i += processingBatchSize) {
        const batch = messages.slice(i, i + processingBatchSize);

        for (const message of batch) {
          stats.messagesProcessed++;

          try {
            const eventData = parsedBatch.get(message.messageId) ?? null;
            await this.processMessage(message, source, eventData);
            stats.eventsCreated++;

            // Update last message ID
            await this.prisma.telegramSource.update({
              where: { id: source.id },
              data: {
                lastMessageId: message.messageId,
                lastCrawledAt: new Date(),
              },
            });
          } catch (error) {
            console.error(
              `Failed to process message ${message.messageId}:`,
              error
            );
            stats.errors.push({
              type: 'message_processing',
              message: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        // Clear the processed batch from memory before loading the next one
        batch.length = 0;
      }

      // Explicitly clear the fetched messages array and parsed data map now
      // that they're no longer needed, to help release memory promptly.
      messages.length = 0;
      parsedBatch.clear();

      // Update last crawled timestamp even if no new messages
      await this.prisma.telegramSource.update({
        where: { id: source.id },
        data: { lastCrawledAt: new Date() },
      });
    } catch (error) {
      console.error(`Error crawling source ${source.name}:`, error);
      stats.errors.push({
        type: 'crawl_error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return stats;
  }

  async startListening(): Promise<void> {
    console.log('Starting Telegram listener...');

    // Load categories for event classification
    await this.loadCategories();

    // Get all active sources to listen to
    const sources = await this.prisma.telegramSource.findMany({
      where: { isActive: true },
      include: { category: true },
    });

    if (sources.length === 0) {
      console.log('No active Telegram sources found');
      return;
    }

    console.log(`Listening to ${sources.length} Telegram sources`);

    // Extract chat IDs
    const chatIds = sources.map((s) => s.chatId);

    // First, resolve chat IDs to get the mapping
    console.log('Resolving chat IDs...');
    const chatIdMapping = await this.telegramClient.resolveChatIds(chatIds);

    // Create a reverse mapping: numeric ID -> source
    const numericIdToSource = new Map<string, (typeof sources)[0]>();
    for (const source of sources) {
      const numericId = chatIdMapping.get(source.chatId);
      if (numericId) {
        numericIdToSource.set(numericId, source);
        console.log(
          `Mapped ${source.chatId} -> ${numericId} for ${source.name}`
        );
      } else {
        // If resolution failed, check if chatId is already numeric
        numericIdToSource.set(source.chatId, source);
      }
    }

    // Now start listening for new messages
    await this.telegramClient.startListening(chatIds, async (message) => {
      // Find the source for this message using the numeric ID
      const source = numericIdToSource.get(String(message.chatId));

      if (!source) {
        console.log(`Received message from unknown source: ${message.chatId}`);
        return;
      }

      console.log(`New message from ${source.name}`);

      try {
        await this.processMessage(message, source);

        // Update last message ID
        await this.prisma.telegramSource.update({
          where: { id: source.id },
          data: {
            lastMessageId: message.messageId,
            lastCrawledAt: new Date(),
          },
        });
      } catch (error) {
        console.error(`Failed to process message ${message.messageId}:`, error);
      }
    });
  }

  private async processMessage(
    message: TelegramMessage,
    source: TelegramSource,
    preComputedEventData?:
      | import('../types/telegram.types.js').ParsedEventData
      | null
  ): Promise<void> {
    // Skip messages without text
    if (!message.text) {
      console.log(`Skipping message ${message.messageId} without text`);
      return;
    }

    console.log(`Processing message ${message.messageId} from ${source.name}`);

    try {
      // Use pre-parsed result when available (crawlSource batch path), otherwise parse inline (listen mode)
      const eventData =
        preComputedEventData !== undefined
          ? preComputedEventData
          : await this.llmParser.parseEventText(message.text, this.categories);

      if (!eventData) {
        console.log(
          `Message ${message.messageId} is not an event post, skipping`
        );
        return;
      }

      // Check for duplicate events
      const isDuplicate = await this.checkDuplicate(
        eventData.title,
        new Date(eventData.startDate)
      );

      if (isDuplicate) {
        console.log(`Event "${eventData.title}" already exists, skipping`);
        return;
      }

      // Upload image if present
      let imageUrl: string | undefined;
      if (message.photo && message.photo.length > 0) {
        try {
          // Get the photo object from the message
          const photo = await this.telegramClient.getPhotoFromMessage(
            source.chatId,
            message.messageId
          );

          if (photo) {
            const imageBuffer = await this.telegramClient.downloadPhoto(photo);
            imageUrl = await this.imageUpload.uploadFromBuffer(
              imageBuffer,
              `${source.name}-${message.messageId}`,
              'image'
            );
            console.log(`Uploaded image: ${imageUrl}`);
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
          // Continue without image
        }
      }

      // Upload video if present
      let videoUrl: string | undefined;
      if (message.video) {
        try {
          // Get the video object from the message
          const video = await this.telegramClient.getVideoFromMessage(
            source.chatId,
            message.messageId
          );

          if (video) {
            console.log(
              `Downloading video from message ${message.messageId}...`
            );
            const videoBuffer = await this.telegramClient.downloadVideo(video);
            console.log(
              `Uploading video (${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB)...`
            );
            videoUrl = await this.imageUpload.uploadFromBuffer(
              videoBuffer,
              `${source.name}-${message.messageId}-video`,
              'video'
            );
            console.log(`Uploaded video: ${videoUrl}`);
          }
        } catch (error) {
          console.error('Failed to upload video:', error);
          // Continue without video
        }
      }

      // Create event in database
      const sourceUrl = this.telegramClient.getMessageLink(
        source.chatId,
        message.messageId
      );

      // Determine category: use LLM-determined category, fallback to source category, then default
      let categoryId = eventData.categoryId;
      if (!categoryId) {
        categoryId = source.categoryId || (await this.getDefaultCategoryId());
        console.log(
          `No category determined by LLM, using ${source.categoryId ? 'source category' : 'default category'}`
        );
      } else {
        console.log(
          `LLM determined category: ${this.categories.find((c) => c.id === categoryId)?.name}`
        );
      }

      const event = await this.prisma.event.create({
        data: {
          title: eventData.title,
          description: eventData.description,
          location: eventData.location || null,
          venue: eventData.venue || null,
          startDate: new Date(eventData.startDate),
          endDate: eventData.endDate ? new Date(eventData.endDate) : null,
          price: eventData.price || null,
          imageUrl: imageUrl || null,
          videoUrl: videoUrl || null,
          source: 'telegram',
          sourceUrl: sourceUrl,
          categoryId: categoryId,
          isActive: true,
          status: EventStatus.Pending,
        },
      });

      // Create event tags
      if (eventData.tags && eventData.tags.length > 0) {
        await this.prisma.eventTag.createMany({
          data: eventData.tags.map((tag) => ({
            eventId: event.id,
            tag: tag.toLowerCase(),
          })),
        });
      }

      console.log(`Created event: ${event.title} (${event.id})`);
    } catch (error) {
      throw error;
    }
  }

  private async checkDuplicate(
    title: string,
    startDate: Date
  ): Promise<boolean> {
    // Check for events with similar title and same start date
    const existingEvent = await this.prisma.event.findFirst({
      where: {
        title: {
          contains: title,
          mode: 'insensitive',
        },
        startDate: {
          gte: new Date(startDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before
          lte: new Date(startDate.getTime() + 24 * 60 * 60 * 1000), // 1 day after
        },
      },
    });

    return existingEvent !== null;
  }

  private async getDefaultCategoryId(): Promise<string> {
    // Get or create default category
    let category = await this.prisma.category.findFirst({
      where: { slug: 'uncategorized' },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: {
          name: 'Uncategorized',
          slug: 'uncategorized',
          description: 'Events without a specific category',
        },
      });
    }

    return category.id;
  }
}

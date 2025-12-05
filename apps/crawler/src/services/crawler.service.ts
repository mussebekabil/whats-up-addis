import puppeteer, { Browser } from 'puppeteer';
import { prisma } from '@whats-up-addis/database';
import { isDuplicate } from '../utils/deduplication.js';
import { GenericScraper, AlxScraper } from '../scrapers/index.js';

export class CrawlerService {
  private browser: Browser | null = null;

  async crawlAll() {
    console.log('Starting crawl of all active sources...');

    // Launch browser once for all crawls
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const sources = await prisma.crawlerSource.findMany({
        where: { isActive: true },
      });

      console.log(`Found ${sources.length} active sources`);

      for (const source of sources) {
        try {
          console.log(`Crawling: ${source.name}`);
          await this.crawlSource(source);

          // Update last crawled timestamp
          await prisma.crawlerSource.update({
            where: { id: source.id },
            data: { lastCrawledAt: new Date() },
          });

          console.log(`✓ Successfully crawled: ${source.name}`);
        } catch (error) {
          console.error(`✗ Error crawling ${source.name}:`, error);
        }
      }

      console.log('Crawl completed');
    } finally {
      // Close browser after all crawls are done
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }
  }

  private async crawlSource(source: any) {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    let scraper;

    // Choose scraper based on type
    switch (source.scraperType) {
      case 'generic':
        scraper = new GenericScraper(source, this.browser);
        break;
      case 'alx':
        scraper = new AlxScraper(source, this.browser);
        break;
      default:
        scraper = new GenericScraper(source, this.browser);
        break;
      // Add more scraper types here as needed
    }

    const events = await scraper.scrape();

    console.log(`Found ${events.length} events from ${source.name}`);

    // Save events to database
    for (const eventData of events) {
      try {
        // Check for duplicates
        const duplicate = await isDuplicate(eventData);

        if (duplicate) {
          console.log(`Skipping duplicate event: ${eventData.title}`);
          continue;
        }

        // Get or create category
        const category = await this.getOrCreateCategory(eventData.categoryName);

        // Create event
        await prisma.event.create({
          data: {
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            venue: eventData.venue,
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            imageUrl: eventData.imageUrl,
            price: eventData.price,
            source: 'crawler',
            sourceUrl: eventData.sourceUrl,
            categoryId: category.id,
            isActive: true,
          },
        });

        console.log(`✓ Created event: ${eventData.title}`);
      } catch (error) {
        console.error(`Error saving event ${eventData.title}:`, error);
      }
    }
  }

  private async getOrCreateCategory(categoryName: string) {
    const slug = categoryName.toLowerCase().replace(/\s+/g, '-');

    let category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug,
        },
      });
    }

    return category;
  }
}

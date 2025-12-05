import cron from 'node-cron';
import { config } from 'dotenv';
import { CrawlerService } from './services/crawler.service.js';

config();

const crawlerService = new CrawlerService();

// Run crawler immediately on start
console.log('🕷️  Starting crawler service...');
crawlerService.crawlAll().catch(console.error);

// Schedule crawler to run based on environment variable or default to every 6 hours
const schedule = process.env.CRAWLER_SCHEDULE || '0 */6 * * *';

cron.schedule(schedule, async () => {
  console.log('🕷️  Running scheduled crawl...');
  try {
    await crawlerService.crawlAll();
  } catch (error) {
    console.error('Crawler error:', error);
  }
});

console.log(`🕷️  Crawler scheduled: ${schedule}`);

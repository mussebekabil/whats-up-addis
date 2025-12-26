import * as cron from 'node-cron';
import { TelegramCrawlerService } from './services/telegram-crawler.service.js';

const MODE = process.env.TELEGRAM_SCRAPER_MODE || 'listen'; // 'listen' or 'cron'
const CRON_SCHEDULE = process.env.TELEGRAM_CRAWLER_SCHEDULE || '0 */2 * * *'; // Every 2 hours

async function runCrawler() {
  console.log('='.repeat(50));
  console.log(`Starting Telegram crawler at ${new Date().toISOString()}`);
  console.log('='.repeat(50));

  const crawler = new TelegramCrawlerService();

  try {
    const stats = await crawler.crawlAll();

    console.log('\n' + '='.repeat(50));
    console.log('Crawler Statistics:');
    console.log('='.repeat(50));

    for (const stat of stats) {
      console.log(`\nSource: ${stat.source}`);
      console.log(`  Messages Processed: ${stat.messagesProcessed}`);
      console.log(`  Events Created: ${stat.eventsCreated}`);
      console.log(`  Errors: ${stat.errors.length}`);

      if (stat.errors.length > 0) {
        console.log('  Error Details:');
        stat.errors.forEach((err) => {
          console.log(`    - ${err.type}: ${err.message}`);
        });
      }
    }

    const totalMessages = stats.reduce(
      (sum, s) => sum + s.messagesProcessed,
      0
    );
    const totalEvents = stats.reduce((sum, s) => sum + s.eventsCreated, 0);
    const totalErrors = stats.reduce((sum, s) => sum + s.errors.length, 0);

    console.log('\n' + '='.repeat(50));
    console.log('Total Summary:');
    console.log(`  Total Messages: ${totalMessages}`);
    console.log(`  Total Events: ${totalEvents}`);
    console.log(`  Total Errors: ${totalErrors}`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Fatal error during crawling:', error);
    process.exit(1);
  }
}

async function startListener() {
  console.log('='.repeat(50));
  console.log('Starting Telegram bot listener mode');
  console.log('='.repeat(50));

  const crawler = new TelegramCrawlerService();

  try {
    await crawler.startListening();
  } catch (error) {
    console.error('Fatal error in listener mode:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('Telegram Events Scraper');
  console.log(`Mode: ${MODE}`);

  if (MODE === 'listen') {
    // Real-time listening mode (recommended for production)
    await startListener();
  } else if (MODE === 'cron') {
    // Scheduled crawling mode
    console.log(`Cron Schedule: ${CRON_SCHEDULE}`);

    // Run immediately on start
    await runCrawler();

    // Schedule subsequent runs
    cron.schedule(CRON_SCHEDULE, async () => {
      await runCrawler();
    });

    console.log('Scheduler started. Press Ctrl+C to exit.');
  } else if (MODE === 'once') {
    // Run once and exit
    await runCrawler();
    process.exit(0);
  } else {
    console.error(`Invalid mode: ${MODE}. Use 'listen', 'cron', or 'once'`);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

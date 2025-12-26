import { PrismaClient } from '@whats-up-addis/database';

/**
 * Reset script to clear telegram scraper state and events
 * This allows re-processing messages with updated category resolution
 */

const prisma = new PrismaClient();

async function main() {
  console.log('Starting reset process...\n');

  try {
    // 1. Delete all events from telegram sources
    const deletedEvents = await prisma.event.deleteMany({
      where: {
        source: 'telegram',
      },
    });
    console.log(
      `✓ Deleted ${deletedEvents.count} events from telegram sources`
    );

    // 2. Reset lastMessageId for all telegram sources
    const updatedSources = await prisma.telegramSource.updateMany({
      data: {
        lastMessageId: null,
        lastCrawledAt: null,
      },
    });
    console.log(
      `✓ Reset ${updatedSources.count} telegram sources (lastMessageId and lastCrawledAt cleared)`
    );

    // 3. Show current telegram sources
    const sources = await prisma.telegramSource.findMany({
      select: {
        id: true,
        name: true,
        chatId: true,
        isActive: true,
        categoryId: true,
      },
    });

    console.log('\nCurrent Telegram Sources:');
    console.log('─'.repeat(80));
    sources.forEach((source) => {
      console.log(`  ${source.isActive ? '✓' : '✗'} ${source.name}`);
      console.log(`    Chat ID: ${source.chatId}`);
      console.log(
        `    Category: ${source.categoryId || 'None (will use LLM)'}`
      );
      console.log();
    });

    console.log(
      '✓ Reset complete! You can now run the scraper to re-process all messages.\n'
    );
  } catch (error) {
    console.error('Error during reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Failed to reset scraper:', e);
  process.exit(1);
});

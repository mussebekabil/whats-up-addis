import { BaseScraper, ScrapedEvent } from './base.scraper.js';
import { CategoryConstants } from '@whats-up-addis/shared';
export class AlxScraper extends BaseScraper {
  async scrape(): Promise<ScrapedEvent[]> {
    const page = await this.browser.newPage();

    try {
      await page.setUserAgent(
        process.env.CRAWLER_USER_AGENT || 'WhatsUpAddis/1.0'
      );
      await page.goto(this.source.baseUrl, { waitUntil: 'networkidle2' });

      const events: ScrapedEvent[] = [];

      // First, extract all event URLs to avoid stale element handles
      const eventUrls = await page.$$eval(
        '.event-item-wrap .event-detail-block-up a',
        (links) =>
          links.map((link) => link.getAttribute('href')).filter(Boolean)
      );
      console.log(`Found ${eventUrls.length} event URLs on the page.`);

      // Navigate to each event URL and scrape the details
      for (const eventUrl of eventUrls) {
        try {
          // Navigate to the event detail page
          const fullUrl = new URL(eventUrl, this.source.baseUrl).toString();
          await page.goto(fullUrl, { waitUntil: 'networkidle2' });

          // Wait a bit for dynamic content to load
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Extract event data directly from page
          const title = await page
            .$eval('main.content .section-title h2', (el) =>
              el.textContent?.trim()
            )
            .catch(() => '');
          const description = await page
            .$eval('main.content .event-post-text p:nth-child(2)', (el) =>
              el.textContent?.trim()
            )
            .catch(() => '');
          const startDateStr = await page
            .$eval('main.content .event-notes li:first-child', (el) =>
              el.textContent?.trim()
            )
            .catch(() => '');
          const location = await page
            .$eval('main.content .event-notes li:nth-child(2)', (el) =>
              el.textContent?.trim()
            )
            .catch(() => '');
          const venue = await page
            .$eval('main.content .event-venue', (el) => el.textContent?.trim())
            .catch(() => location);
          const endDateStr = await page
            .$eval('main.content .event-notes li:first-child', (el) =>
              el.textContent?.trim()
            )
            .catch(() => startDateStr);
          const imageUrl = await page
            .$eval('main.content .event-post-banner-section img', (el) =>
              el.getAttribute('src')
            )
            .catch(() => null);
          //const priceStr = await page.$eval('main.content .event-price', el => el.textContent?.trim()).catch(() => '');

          if (!title || !startDateStr) {
            console.warn(
              `Title "${title}" and start date "${startDateStr}" are not found, Skipping`
            );
            continue; // Skip if essential data is missing
          }

          events.push({
            title: this.cleanText(title || ''),
            description: this.cleanText(description || ''),
            location: this.cleanText(location || ''),
            venue: this.cleanText(venue || location || ''),
            startDate: this.normalizeDate(startDateStr),
            endDate: this.normalizeDate(endDateStr || startDateStr),
            imageUrl: imageUrl
              ? new URL(imageUrl, this.source.baseUrl).toString()
              : undefined,
            // price: priceStr ? this.extractPrice(priceStr) : undefined,
            sourceUrl: fullUrl,
            categoryName: CategoryConstants.Technology,
          });
        } catch (error) {
          console.error(`Error parsing event ${eventUrl}:`, error);
        }
      }

      return events;
    } catch (error) {
      console.error(`Error scraping ${this.source.baseUrl}:`, error);
      return [];
    } finally {
      await page.close();
    }
  }
}

import { BaseScraper, ScrapedEvent } from './base.scraper.js';
import { CategoryConstants } from '@whats-up-addis/common';

export class GenericScraper extends BaseScraper {
  async scrape(): Promise<ScrapedEvent[]> {
    const page = await this.browser.newPage();

    try {
      await page.setUserAgent(
        process.env.CRAWLER_USER_AGENT || 'WhatsUpAddis/1.0'
      );
      await page.goto(this.source.baseUrl, { waitUntil: 'networkidle2' });

      const events: ScrapedEvent[] = [];

      // This is a generic scraper template
      // You'll need to customize the selectors based on the actual website structure

      const eventElements = await page.$$('.event-item');

      for (const element of eventElements) {
        try {
          const title = await element.$eval(
            '.event-title',
            (el) => el.textContent
          );
          const description = await element
            .$eval('.event-description', (el) => el.textContent)
            .catch(() => '');
          const location = await element
            .$eval('.event-location', (el) => el.textContent)
            .catch(() => '');
          const venue = await element
            .$eval('.event-venue', (el) => el.textContent)
            .catch(() => location);
          const startDateStr = await element
            .$eval('.event-start-date', (el) => el.textContent)
            .catch(() => '');
          const endDateStr = await element
            .$eval('.event-end-date', (el) => el.textContent)
            .catch(() => startDateStr);
          const imageUrl = await element
            .$eval('.event-image', (el) => el.getAttribute('src'))
            .catch(() => null);
          const priceStr = await element
            .$eval('.event-price', (el) => el.textContent)
            .catch(() => '');
          const eventUrl = await element
            .$eval('a', (el) => el.getAttribute('href'))
            .catch(() => null);

          if (!title || !startDateStr) {
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
            price: priceStr ? this.extractPrice(priceStr) : undefined,
            sourceUrl: eventUrl
              ? new URL(eventUrl, this.source.baseUrl).toString()
              : this.source.baseUrl,
            categoryName: CategoryConstants.General, // Default category
          });
        } catch (error) {
          console.error('Error parsing event:', error);
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

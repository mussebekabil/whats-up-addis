import type { Browser } from 'puppeteer';

export interface ScrapedEvent {
  title: string;
  description: string;
  location: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  price?: number;
  sourceUrl: string;
  categoryName: string;
}

export abstract class BaseScraper {
  protected source: any;
  protected browser: Browser;

  constructor(source: any, browser: Browser) {
    this.source = source;
    this.browser = browser;
  }

  abstract scrape(): Promise<ScrapedEvent[]>;

  protected normalizeDate(dateString: string): Date {
    // Add custom date parsing logic here
    return new Date(dateString);
  }

  protected extractPrice(priceString: string): number | undefined {
    // Extract numeric price from string
    const match = priceString.match(/\d+\.?\d*/);
    return match ? parseFloat(match[0]) : undefined;
  }

  protected cleanText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }
}

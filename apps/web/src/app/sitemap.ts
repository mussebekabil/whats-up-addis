import { MetadataRoute } from 'next';
import { eventService } from '@/lib/events';
import { categoryService } from '@/lib/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://whatsupaddis.io';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  try {
    // Fetch all events for sitemap
    const eventsResponse = await eventService.getEvents({ page: 1, limit: 1000 });
    const events = eventsResponse.data;

    const eventPages: MetadataRoute.Sitemap = events.map((event: any) => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: new Date(event.updatedAt || event.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Fetch all categories for sitemap
    const categories = await categoryService.getCategories();

    const categoryPages: MetadataRoute.Sitemap = categories.map((category: any) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...eventPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least the static pages if dynamic content fails
    return staticPages;
  }
}

import { MetadataRoute } from 'next';
import { eventService } from '@/lib/events';
import { categoryService } from '@/lib/categories';
import { getAllPlaceSlugs } from '@/lib/place-content';
import { GUIDES } from '@/lib/guides';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://whatsupaddis.io';

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
    {
      url: `${baseUrl}/places`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Place pages — reads markdown files synchronously, no API call needed
  const placeSlugs = getAllPlaceSlugs();
  const placePages: MetadataRoute.Sitemap = placeSlugs.map((slug) => ({
    url: `${baseUrl}/places/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Guide pages — derived from static config, no API call needed
  const guidePages: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  try {
    const eventsResponse = await eventService.getEvents({
      page: 1,
      limit: 1000,
    });
    const events = eventsResponse.data;

    const eventPages: MetadataRoute.Sitemap = events.map((event: any) => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: new Date(event.updatedAt || event.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const categories = await categoryService.getCategories();

    const categoryPages: MetadataRoute.Sitemap = categories.map(
      (category: any) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    );

    return [
      ...staticPages,
      ...eventPages,
      ...categoryPages,
      ...placePages,
      ...guidePages,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [...staticPages, ...placePages, ...guidePages];
  }
}

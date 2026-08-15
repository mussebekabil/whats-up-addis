export interface GuideConfig {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  eventKeywords: string[];
  area?: string;
}

export const GUIDES: GuideConfig[] = [
  {
    slug: 'best-coffee-spots-in-addis-ababa',
    title: 'Best Coffee Spots in Addis Ababa',
    description:
      'Discover the finest traditional and modern coffee experiences in Addis Ababa, from historic buna ceremonies to specialty third-wave cafes.',
    categorySlug: 'coffee',
    eventKeywords: ['coffee', 'buna', 'cafe'],
  },
  {
    slug: 'addis-ababa-nightlife-guide',
    title: 'Addis Ababa Nightlife Guide',
    description:
      'From rooftop bars to live music venues, explore the best of Addis Ababa after dark.',
    categorySlug: 'nightlife',
    eventKeywords: ['nightlife', 'music', 'concert', 'live'],
  },
  {
    slug: 'cultural-sites-in-addis-ababa',
    title: 'Cultural Sites in Addis Ababa',
    description:
      "Explore monuments, churches, and landmarks that tell the story of Ethiopia's rich history and culture.",
    categorySlug: 'cultural-sites',
    eventKeywords: ['culture', 'heritage', 'festival', 'traditional'],
  },
  {
    slug: 'museums-in-addis-ababa',
    title: 'Museums in Addis Ababa',
    description:
      "A guide to Addis Ababa's best museums, from ancient fossils to the artifacts of a turbulent 20th century.",
    categorySlug: 'museums',
    eventKeywords: ['museum', 'exhibition', 'art', 'history'],
  },
  {
    slug: 'parks-and-nature-in-addis-ababa',
    title: 'Parks & Nature in Addis Ababa',
    description:
      "Escape the city in Addis Ababa's parks, forests, and natural escapes — from Entoto to Sheger Park.",
    categorySlug: 'parks-nature',
    eventKeywords: ['outdoor', 'nature', 'park', 'hiking'],
  },
  {
    slug: 'best-restaurants-in-addis-ababa',
    title: 'Best Restaurants in Addis Ababa',
    description:
      'The top restaurants in Addis Ababa for traditional Ethiopian cuisine and beyond.',
    categorySlug: 'restaurants',
    eventKeywords: ['food', 'dining', 'restaurant', 'cuisine'],
  },
];

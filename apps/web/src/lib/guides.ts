export interface GuideConfig {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  eventKeywords: string[];
  area?: string;
  imageUrl?: string;
}

export const GUIDES: GuideConfig[] = [
  {
    slug: 'best-coffee-spots-in-addis-ababa',
    title: 'Best Coffee Spots in Addis Ababa',
    description:
      'Discover the finest traditional and modern coffee experiences in Addis Ababa, from historic buna ceremonies to specialty third-wave cafes.',
    categorySlug: 'coffee',
    eventKeywords: ['coffee', 'buna', 'cafe'],
    imageUrl:
      'https://res.cloudinary.com/dlvwfihop/image/upload/v1786795388/whats-up-addis/places/dumerso-coffee-1786795385996.jpg',
  },
  {
    slug: 'addis-ababa-nightlife-guide',
    title: 'Addis Ababa Nightlife Guide',
    description:
      'From rooftop bars to live music venues, explore the best of Addis Ababa after dark.',
    categorySlug: 'nightlife',
    eventKeywords: ['nightlife', 'music', 'concert', 'live'],
    imageUrl:
      'https://res.cloudinary.com/dlvwfihop/image/upload/v1786795410/whats-up-addis/places/signature-lounge-1786795403280.jpg',
  },
  {
    slug: 'cultural-sites-in-addis-ababa',
    title: 'Cultural Sites in Addis Ababa',
    description:
      "Explore monuments, churches, and landmarks that tell the story of Ethiopia's rich history and culture.",
    categorySlug: 'cultural-sites',
    eventKeywords: ['culture', 'heritage', 'festival', 'traditional'],
    imageUrl:
      'https://res.cloudinary.com/dlvwfihop/image/upload/v1786209562/whats-up-addis/places/adwa-victory-memorial-1786209557663.jpg',
  },
  {
    slug: 'museums-in-addis-ababa',
    title: 'Museums in Addis Ababa',
    description:
      "A guide to Addis Ababa's best museums, from ancient fossils to the artifacts of a turbulent 20th century.",
    categorySlug: 'museums',
    eventKeywords: ['museum', 'exhibition', 'art', 'history'],
    imageUrl:
      'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271397/whats-up-addis/places/ethiopian-national-museum-1786271394821.jpg',
  },
  {
    slug: 'parks-and-nature-in-addis-ababa',
    title: 'Parks & Nature in Addis Ababa',
    description:
      "Escape the city in Addis Ababa's parks, forests, and natural escapes — from Entoto to Sheger Park.",
    categorySlug: 'parks-nature',
    eventKeywords: ['outdoor', 'nature', 'park', 'hiking'],
    imageUrl:
      'https://res.cloudinary.com/dlvwfihop/image/upload/v1786277439/whats-up-addis/places/entoto-natural-park-1786277435506.jpg',
  },
  {
    slug: 'best-restaurants-in-addis-ababa',
    title: 'Best Restaurants in Addis Ababa',
    description:
      'The top restaurants in Addis Ababa for traditional Ethiopian cuisine and beyond.',
    categorySlug: 'restaurants',
    eventKeywords: ['food', 'dining', 'restaurant', 'cuisine'],
    imageUrl:
      'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271420/whats-up-addis/places/habesha-2000-1786271419390.jpg',
  },
];

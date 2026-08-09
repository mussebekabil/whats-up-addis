import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create event categories (applies: EVENT by default)
  const eventCategories = [
    {
      name: 'Music & Concerts',
      slug: 'music-concerts',
      description: 'Live music performances and concerts',
    },
    {
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Sports events, marathons, and fitness activities',
    },
    {
      name: 'Arts & Culture',
      slug: 'arts-culture',
      description: 'Art exhibitions, cultural events, and theater',
    },
    {
      name: 'Food & Drink',
      slug: 'food-drink',
      description: 'Food festivals, restaurant openings, and culinary events',
    },
    {
      name: 'Business & Professional',
      slug: 'business-professional',
      description: 'Conferences, networking events, and workshops',
    },
    {
      name: 'Community & Social',
      slug: 'community-social',
      description: 'Community gatherings and social events',
    },
    {
      name: 'Education & Learning',
      slug: 'education-learning',
      description: 'Educational workshops, seminars, and training',
    },
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Tech meetups, hackathons, and innovation events',
    },
  ];

  for (const category of eventCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('Event categories seeded successfully');

  // Create place-specific categories
  const placeCategories = [
    {
      name: 'Museums',
      slug: 'museums',
      description: 'Museums, galleries, and historical collections',
      applies: 'PLACE' as const,
    },
    {
      name: 'Cultural Sites',
      slug: 'cultural-sites',
      description: 'Cultural landmarks, monuments, and historical sites',
      applies: 'PLACE' as const,
    },
    {
      name: 'Parks & Nature',
      slug: 'parks-nature',
      description: 'Parks, nature reserves, and outdoor spaces',
      applies: 'BOTH' as const,
    },
    {
      name: 'Restaurants',
      slug: 'restaurants',
      description: 'Restaurants, eateries, and dining experiences',
      applies: 'PLACE' as const,
    },
    {
      name: 'Shopping',
      slug: 'shopping',
      description: 'Markets, malls, and shopping destinations',
      applies: 'PLACE' as const,
    },
  ];

  for (const category of placeCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('Place categories seeded successfully');

  // Create a sample admin user (password: admin123)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@whatsupaddis.com' },
    update: {},
    create: {
      email: 'admin@whatsupaddis.com',
      passwordHash: '$2b$10$YourHashedPasswordHere', // This should be properly hashed
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', adminUser.email);

  // Create sample events
  const musicCategory = await prisma.category.findUnique({
    where: { slug: 'music-concerts' },
  });

  const techCategory = await prisma.category.findUnique({
    where: { slug: 'technology' },
  });

  const foodCategory = await prisma.category.findUnique({
    where: { slug: 'food-drink' },
  });

  const sampleEvents = [
    {
      title: 'Addis Jazz Festival 2025',
      description:
        'Join us for the annual Addis Jazz Festival featuring local and international artists. Experience the best of jazz music in a beautiful outdoor setting.',
      location: 'Addis Ababa',
      venue: 'Addis Ababa Stadium',
      startDate: new Date('2025-02-15T18:00:00'),
      endDate: new Date('2025-02-15T23:00:00'),
      imageUrl:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      price: 500.0,
      source: 'manual',
      categoryId: musicCategory?.id,
      isActive: true,
    },
    {
      title: 'Ethiopian Coffee Ceremony Workshop',
      description:
        'Learn the traditional Ethiopian coffee ceremony from expert baristas. Discover the rich history and culture behind Ethiopian coffee.',
      location: 'Addis Ababa',
      venue: 'Tomoca Coffee',
      startDate: new Date('2025-01-25T14:00:00'),
      endDate: new Date('2025-01-25T16:00:00'),
      price: 200.0,
      source: 'manual',
      categoryId: foodCategory?.id,
      isActive: true,
    },
    {
      title: 'Tech Startup Meetup',
      description:
        'Connect with fellow entrepreneurs, developers, and tech enthusiasts. Share ideas, learn from each other, and build the future of tech in Ethiopia.',
      location: 'Addis Ababa',
      venue: 'Ice Addis',
      startDate: new Date('2025-01-30T18:00:00'),
      endDate: new Date('2025-01-30T21:00:00'),
      source: 'manual',
      categoryId: techCategory?.id,
      isActive: true,
    },
    {
      title: 'Meskel Square Concert',
      description:
        'A free outdoor concert featuring popular Ethiopian artists. Bring your family and friends for an evening of music and entertainment.',
      location: 'Addis Ababa',
      venue: 'Meskel Square',
      startDate: new Date('2025-02-20T17:00:00'),
      endDate: new Date('2025-02-20T22:00:00'),
      source: 'manual',
      categoryId: musicCategory?.id,
      isActive: true,
    },
    {
      title: 'Addis Food Festival',
      description:
        'Taste the best Ethiopian and international cuisine from top restaurants and chefs. Family-friendly event with live cooking demonstrations.',
      location: 'Addis Ababa',
      venue: 'Sheger Park',
      startDate: new Date('2025-03-05T11:00:00'),
      endDate: new Date('2025-03-05T20:00:00'),
      price: 150.0,
      source: 'manual',
      categoryId: foodCategory?.id,
      isActive: true,
    },
    {
      title: 'AI & Machine Learning Workshop',
      description:
        'Hands-on workshop on artificial intelligence and machine learning. Learn practical skills and build your first ML model.',
      location: 'Addis Ababa',
      venue: 'Addis Ababa University',
      startDate: new Date('2025-02-10T09:00:00'),
      endDate: new Date('2025-02-10T17:00:00'),
      price: 800.0,
      source: 'manual',
      categoryId: techCategory?.id,
      isActive: true,
    },
  ];

  for (const event of sampleEvents) {
    if (event.categoryId) {
      await prisma.event.create({
        data: {
          ...event,
          categoryId: event.categoryId as string,
        },
      });
    }
  }

  console.log('Sample events created');

  // Create sample crawler sources
  const crawlerSources = [
    {
      name: 'Sample Event Site 1',
      baseUrl: 'https://example.com/events',
      scraperType: 'generic',
      isActive: false,
    },
    {
      name: 'Sample Event Site 2',
      baseUrl: 'https://another-example.com/events',
      scraperType: 'generic',
      isActive: false,
    },
  ];

  for (const source of crawlerSources) {
    await prisma.crawlerSource.create({
      data: source,
    });
  }

  console.log('Crawler sources seeded successfully');

  // Seed Places
  const museumsCategory = await prisma.category.findUnique({
    where: { slug: 'museums' },
  });
  const culturalSitesCategory = await prisma.category.findUnique({
    where: { slug: 'cultural-sites' },
  });
  const parksNatureCategory = await prisma.category.findUnique({
    where: { slug: 'parks-nature' },
  });
  const restaurantsCategory = await prisma.category.findUnique({
    where: { slug: 'restaurants' },
  });
  const shoppingCategory = await prisma.category.findUnique({
    where: { slug: 'shopping' },
  });

  // featured: exactly 6 places marked as featured
  // Featured: ethiopian-national-museum, the-palace-museum, unity-park, entoto-natural-park, sheger-park, yod-abyssinia
  const placesData = [
    // Museums
    {
      slug: 'ethiopian-national-museum',
      name: 'The National Museum of Ethiopia',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271397/whats-up-addis/places/ethiopian-national-museum-1786271394821.jpg',
      categoryId: museumsCategory?.id,
      featured: true,
    },
    {
      slug: 'the-palace-museum',
      name: 'The Palace Museum',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786209603/whats-up-addis/places/the-palace-museum-1786209602579.jpg',
      categoryId: museumsCategory?.id,
      featured: true,
    },
    {
      slug: 'red-terror-martyrs-memorial-museum',
      name: "Red Terror Martyrs' Memorial Museum",
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786277431/whats-up-addis/places/red-terror-martyrs-memorial-museum-1786277428253.jpg',
      categoryId: museumsCategory?.id,
      featured: false,
    },
    {
      slug: 'ethnological-museum',
      name: 'Ethnological Museum',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786277429/whats-up-addis/places/ethnological-museum-1786277424868.jpg',
      categoryId: museumsCategory?.id,
      featured: false,
    },
    // Cultural Sites
    {
      slug: 'unity-park',
      name: 'Unity Park',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786209583/whats-up-addis/places/unity-park-1786209579575.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: true,
    },
    {
      slug: 'adwa-victory-memorial',
      name: 'Adwa Victory Memorial',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786209562/whats-up-addis/places/adwa-victory-memorial-1786209557663.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    {
      slug: 'holy-trinity-cathedral',
      name: 'Holy Trinity Cathedral',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271386/whats-up-addis/places/holy-trinity-cathedral-1786271383811.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    {
      slug: 'meskel-square',
      name: 'Meskel Square',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271389/whats-up-addis/places/meskel-square-1786271387496.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    {
      slug: 'entoto-maryam-church',
      name: 'Entoto Maryam Church',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271381/whats-up-addis/places/entoto-maryam-church-1786271378468.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    {
      slug: 'lion-of-judah-statue',
      name: 'Lion of Judah Statue',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786292241/whats-up-addis/places/lion-of-judah-statue-1786292238833.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    {
      slug: 'tiglachin-monument',
      name: 'Tiglachin Monument',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786292249/whats-up-addis/places/tiglachin-monument-1786292246414.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    {
      slug: 'grand-anwar-mosque',
      name: 'Grand Anwar Mosque',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786292238/whats-up-addis/places/grand-anwar-mosque-1786292235062.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    {
      slug: 'arada-giorgis-church',
      name: 'Arada Giorgis Church',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786292233/whats-up-addis/places/arada-giorgis-church-1786292230055.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    {
      slug: 'national-palace',
      name: 'The National Palace',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786292242/whats-up-addis/places/national-palace-1786292239695.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    {
      slug: 'yekatit-12-square',
      name: 'Yekatit 12 Square',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786292252/whats-up-addis/places/yekatit-12-square-1786292249946.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    {
      slug: 'tewodros-square',
      name: 'Tewodros Square',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786292246/whats-up-addis/places/tewodros-square-1786292243055.jpg',
      categoryId: culturalSitesCategory?.id,
      featured: false,
    },
    // Parks & Nature
    {
      slug: 'entoto-natural-park',
      name: 'Entoto Natural Park',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786277439/whats-up-addis/places/entoto-natural-park-1786277435506.jpg',
      categoryId: parksNatureCategory?.id,
      featured: true,
    },
    {
      slug: 'sheger-park',
      name: 'Sheger Park / Friendship Park',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786277469/whats-up-addis/places/sheger-park-1786277466555.jpg',
      categoryId: parksNatureCategory?.id,
      featured: true,
    },
    {
      slug: 'menagesha-suba-forest',
      name: 'Menagesha Suba Forest',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271413/whats-up-addis/places/menagesha-suba-forest-1786271410385.jpg',
      categoryId: parksNatureCategory?.id,
      featured: false,
    },
    // Restaurants
    {
      slug: 'yod-abyssinia',
      name: 'Yod Abyssinia Cultural Restaurant',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271441/whats-up-addis/places/yod-abyssinia-1786271437829.jpg',
      categoryId: restaurantsCategory?.id,
      featured: true,
    },
    {
      slug: 'habesha-2000',
      name: 'Habesha 2000 Restaurant',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271420/whats-up-addis/places/habesha-2000-1786271419390.jpg',
      categoryId: restaurantsCategory?.id,
      featured: false,
    },
    {
      slug: 'kategna-restaurant',
      name: 'Kategna Restaurant',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271429/whats-up-addis/places/kategna-restaurant-1786271424728.jpg',
      categoryId: restaurantsCategory?.id,
      featured: false,
    },
    // Shopping
    {
      slug: 'merkato',
      name: 'Merkato',
      imageUrl:
        'https://res.cloudinary.com/dlvwfihop/image/upload/v1786271448/whats-up-addis/places/merkato-1786271445779.jpg',
      categoryId: shoppingCategory?.id,
      featured: false,
    },
    {
      slug: 'african-union-handcraft-market',
      name: 'African Union Handcraft Market',
      imageUrl:
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200',
      categoryId: shoppingCategory?.id,
      featured: false,
    },
    {
      slug: 'shola-market',
      name: 'Shola Market',
      imageUrl:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
      categoryId: shoppingCategory?.id,
      featured: false,
    },
  ];

  for (const place of placesData) {
    if (!place.categoryId) {
      throw new Error(`Category not found for place: ${place.slug}`);
    }
    await prisma.place.upsert({
      where: { slug: place.slug },
      update: {
        name: place.name,
        imageUrl: place.imageUrl,
        featured: place.featured,
      },
      create: {
        slug: place.slug,
        name: place.name,
        imageUrl: place.imageUrl,
        categoryId: place.categoryId,
        featured: place.featured,
      },
    });
  }

  const featuredCount = placesData.filter((p) => p.featured).length;
  console.log(
    `Places seeded successfully (${placesData.length} total, ${featuredCount} featured)`
  );

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

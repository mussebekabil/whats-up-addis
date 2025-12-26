import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = [
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

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('Categories seeded successfully');

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

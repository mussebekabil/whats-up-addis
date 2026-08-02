import { prisma } from '@whats-up-addis/database';

const EVENT_SELECT = {
  id: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  location: true,
  venue: true,
  imageUrl: true,
  category: { select: { name: true, slug: true } },
} as const;

export async function getUpcomingEventsForCategories(
  categoryIds: string[],
  limit = 6
) {
  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  return prisma.event.findMany({
    where: {
      status: 'ACCEPTED',
      isActive: true,
      categoryId: { in: categoryIds },
      startDate: { gte: now, lte: in14Days },
    },
    orderBy: { startDate: 'asc' },
    take: limit,
    select: EVENT_SELECT,
  });
}

export async function getUpcomingEvents(limit = 6) {
  const now = new Date();

  return prisma.event.findMany({
    where: {
      status: 'ACCEPTED',
      isActive: true,
      startDate: { gte: now },
    },
    orderBy: { startDate: 'asc' },
    take: limit,
    select: EVENT_SELECT,
  });
}

export type UpcomingEvent = Awaited<
  ReturnType<typeof getUpcomingEvents>
>[number];

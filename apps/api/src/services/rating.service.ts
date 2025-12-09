import { prisma } from '@whats-up-addis/database';
import type { CreateRatingInput } from '@whats-up-addis/shared';

export class RatingService {
  async getEventRatingStats(eventId: string, userId?: string) {
    const ratings = await prisma.rating.findMany({
      where: { eventId },
    });

    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    const userRating = userId
      ? await prisma.rating.findUnique({
          where: {
            eventId_userId: {
              eventId,
              userId,
            },
          },
        })
      : null;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings,
      userRating: userRating?.rating,
    };
  }

  async createOrUpdateRating(
    eventId: string,
    userId: string,
    data: CreateRatingInput
  ) {
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user already rated this event
    const existingRating = await prisma.rating.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRating) {
      // Update existing rating
      return prisma.rating.update({
        where: { id: existingRating.id },
        data: { rating: data.rating },
      });
    } else {
      // Create new rating
      return prisma.rating.create({
        data: {
          rating: data.rating,
          eventId,
          userId,
        },
      });
    }
  }

  async deleteRating(eventId: string, userId: string) {
    const rating = await prisma.rating.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!rating) {
      throw new Error('Rating not found');
    }

    await prisma.rating.delete({
      where: { id: rating.id },
    });

    return { message: 'Rating deleted successfully' };
  }
}

import { prisma, type Prisma } from '@whats-up-addis/database';
import {
  PlaceFiltersInput,
  calculatePagination,
  type CreateRatingInput,
  type PlaceRatingStats,
  Roles,
} from '@whats-up-addis/shared';
import { AppError } from '../middleware/error-handler.js';

export class PlaceService {
  async getPlaces(filters: PlaceFiltersInput) {
    const { categoryId, search, featured, page = 1, limit = 20 } = filters;

    const where: Prisma.PlaceWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    const skip = (page - 1) * limit;

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.place.count({ where }),
    ]);

    return {
      data: places,
      pagination: calculatePagination(total, page, limit),
    };
  }

  async getPlaceById(id: string) {
    const place = await prisma.place.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        category: true,
        ratings: true,
      },
    });

    if (!place) {
      throw new AppError(404, 'Place not found');
    }

    return place;
  }

  async getPlaceRatingStats(
    placeId: string,
    userId?: string
  ): Promise<PlaceRatingStats> {
    const ratings = await prisma.placeRating.findMany({
      where: { placeId },
    });

    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    const userRating = userId
      ? await prisma.placeRating.findUnique({
          where: {
            placeId_userId: {
              placeId,
              userId,
            },
          },
        })
      : null;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      userRating: userRating?.rating,
    };
  }

  async createOrUpdateRating(
    placeId: string,
    userId: string,
    data: CreateRatingInput
  ): Promise<PlaceRatingStats> {
    // Verify place exists
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new AppError(404, 'Place not found');
    }

    // Check if user already rated this place
    const existingRating = await prisma.placeRating.findUnique({
      where: {
        placeId_userId: {
          placeId,
          userId,
        },
      },
    });

    if (existingRating) {
      await prisma.placeRating.update({
        where: { id: existingRating.id },
        data: { rating: data.rating },
      });
    } else {
      await prisma.placeRating.create({
        data: {
          rating: data.rating,
          placeId,
          userId,
        },
      });
    }

    return this.getPlaceRatingStats(placeId, userId);
  }

  async getPlaceComments(placeId: string, userId?: string) {
    const comments = await prisma.placeComment.findMany({
      where: {
        placeId,
        parentCommentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: true,
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            likes: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments.map((comment) => ({
      ...comment,
      likesCount: comment.likes.length,
      isLikedByUser: userId
        ? comment.likes.some((like) => like.userId === userId)
        : false,
      replies: comment.replies?.map((reply) => ({
        ...reply,
        likesCount: reply.likes.length,
        isLikedByUser: userId
          ? reply.likes.some((like) => like.userId === userId)
          : false,
      })),
    }));
  }

  async createPlaceComment(
    placeId: string,
    userId: string,
    data: { content: string; parentCommentId?: string }
  ) {
    // Verify place exists
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new AppError(404, 'Place not found');
    }

    // If replying to a comment, verify parent exists
    if (data.parentCommentId) {
      const parentComment = await prisma.placeComment.findUnique({
        where: { id: data.parentCommentId },
      });

      if (!parentComment) {
        throw new Error('Parent comment not found');
      }

      if (parentComment.placeId !== placeId) {
        throw new Error('Parent comment does not belong to this place');
      }
    }

    const comment = await prisma.placeComment.create({
      data: {
        content: data.content,
        placeId,
        userId,
        parentCommentId: data.parentCommentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: true,
      },
    });

    return {
      ...comment,
      likesCount: 0,
      isLikedByUser: false,
    };
  }

  async togglePlaceCommentLike(commentId: string, userId: string) {
    const comment = await prisma.placeComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    const existingLike = await prisma.placeCommentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existingLike) {
      await prisma.placeCommentLike.delete({
        where: { id: existingLike.id },
      });
      return { liked: false, message: 'Comment unliked' };
    } else {
      await prisma.placeCommentLike.create({
        data: { commentId, userId },
      });
      return { liked: true, message: 'Comment liked' };
    }
  }

  async deletePlaceComment(
    commentId: string,
    userId: string,
    userRole: string
  ) {
    const comment = await prisma.placeComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId && userRole !== Roles.Admin) {
      throw new Error('You can only delete your own comments');
    }

    await prisma.placeComment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }
}

import { prisma } from '@whats-up-addis/database';
import type {
  CreateCommentInput,
  UpdateCommentInput,
} from '@whats-up-addis/shared';
import { Roles } from '@whats-up-addis/shared';

export class CommentService {
  async getCommentsByEventId(eventId: string, userId?: string) {
    const comments = await prisma.comment.findMany({
      where: {
        eventId,
        parentCommentId: null, // Only get top-level comments
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

    // Add likesCount and isLikedByUser to each comment and reply
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

  async createComment(
    eventId: string,
    userId: string,
    data: CreateCommentInput
  ) {
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // If replying to a comment, verify parent exists
    if (data.parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentCommentId },
      });

      if (!parentComment) {
        throw new Error('Parent comment not found');
      }

      if (parentComment.eventId !== eventId) {
        throw new Error('Parent comment does not belong to this event');
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        eventId,
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

  async updateComment(
    commentId: string,
    userId: string,
    data: UpdateCommentInput
  ) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new Error('You can only edit your own comments');
    }

    return prisma.comment.update({
      where: { id: commentId },
      data: {
        content: data.content,
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
  }

  async deleteComment(commentId: string, userId: string, userRole: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Only comment owner or admin can delete
    if (comment.userId !== userId && userRole !== Roles.Admin) {
      throw new Error('You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }

  async toggleLike(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return { liked: false, message: 'Comment unliked' };
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });
      return { liked: true, message: 'Comment liked' };
    }
  }
}

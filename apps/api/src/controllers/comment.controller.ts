import { Response, NextFunction } from 'express';
import {
  createCommentSchema,
  updateCommentSchema,
} from '@whats-up-addis/shared';
import { CommentService } from '../services/comment.service.js';
import { AuthRequest } from '../middleware/auth.js';

const commentService = new CommentService();

export class CommentController {
  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;

      const comments = await commentService.getCommentsByEventId(
        eventId,
        userId
      );
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async createComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { eventId } = req.params;
      const data = createCommentSchema.parse(req.body);

      const comment = await commentService.createComment(
        eventId,
        req.user.id,
        data
      );
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { commentId } = req.params;
      const data = updateCommentSchema.parse(req.body);

      const comment = await commentService.updateComment(
        commentId,
        req.user.id,
        data
      );
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { commentId } = req.params;

      const result = await commentService.deleteComment(
        commentId,
        req.user.id,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { commentId } = req.params;

      const result = await commentService.toggleLike(commentId, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

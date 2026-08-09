import { Response, NextFunction } from 'express';
import {
  placeFiltersSchema,
  createRatingSchema,
  createCommentSchema,
} from '@whats-up-addis/shared';
import { PlaceService } from '../services/place.service.js';
import { AuthRequest } from '../middleware/auth.js';

const placeService = new PlaceService();

export class PlaceController {
  async getPlaces(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = placeFiltersSchema.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      });

      const result = await placeService.getPlaces(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPlaceById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const place = await placeService.getPlaceById(id);
      res.json(place);
    } catch (error) {
      next(error);
    }
  }

  async getRatingStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const stats = await placeService.getPlaceRatingStats(id, userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdateRating(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const data = createRatingSchema.parse(req.body);

      const stats = await placeService.createOrUpdateRating(
        id,
        req.user.id,
        data
      );
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const comments = await placeService.getPlaceComments(id, userId);
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

      const { id } = req.params;
      const data = createCommentSchema.parse(req.body);

      const comment = await placeService.createPlaceComment(
        id,
        req.user.id,
        data
      );
      res.status(201).json(comment);
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

      const result = await placeService.togglePlaceCommentLike(
        commentId,
        req.user.id
      );
      res.json(result);
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

      const result = await placeService.deletePlaceComment(
        commentId,
        req.user.id,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

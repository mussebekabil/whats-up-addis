import { Request, Response, NextFunction } from 'express';
import { createRatingSchema } from '@whats-up-addis/shared';
import { RatingService } from '../services/rating.service.js';
import { AuthRequest } from '../middleware/auth.js';

const ratingService = new RatingService();

export class RatingController {
  async getRatingStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;

      const stats = await ratingService.getEventRatingStats(eventId, userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdateRating(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { eventId } = req.params;
      const data = createRatingSchema.parse(req.body);

      const rating = await ratingService.createOrUpdateRating(eventId, req.user.id, data);
      res.json(rating);
    } catch (error) {
      next(error);
    }
  }

  async deleteRating(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { eventId } = req.params;

      const result = await ratingService.deleteRating(eventId, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

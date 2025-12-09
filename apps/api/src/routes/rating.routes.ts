import { Router } from 'express';
import { RatingController } from '../controllers/rating.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();
const ratingController = new RatingController();

// Get rating stats for an event (public, but shows user rating if authenticated)
router.get(
  '/events/:eventId/ratings',
  optionalAuth,
  ratingController.getRatingStats
);

// Create or update a rating (requires auth)
router.post(
  '/events/:eventId/ratings',
  authenticate,
  ratingController.createOrUpdateRating
);

// Delete a rating (requires auth)
router.delete(
  '/events/:eventId/ratings',
  authenticate,
  ratingController.deleteRating
);

export default router;

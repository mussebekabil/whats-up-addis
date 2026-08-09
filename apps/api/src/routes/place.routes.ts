import { Router } from 'express';
import { PlaceController } from '../controllers/place.controller.js';
import { apiLimiter } from '../middleware/rate-limit.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();
const placeController = new PlaceController();

router.get('/', apiLimiter, placeController.getPlaces);
router.get('/:id', apiLimiter, placeController.getPlaceById);
router.get('/:id/ratings', optionalAuth, placeController.getRatingStats);
router.post('/:id/ratings', authenticate, placeController.createOrUpdateRating);
router.get('/:id/comments', optionalAuth, placeController.getComments);
router.post('/:id/comments', authenticate, placeController.createComment);
router.post(
  '/:id/comments/:commentId/like',
  authenticate,
  placeController.toggleLike
);
router.delete(
  '/:id/comments/:commentId',
  authenticate,
  placeController.deleteComment
);

export default router;

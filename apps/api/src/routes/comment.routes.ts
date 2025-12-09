import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();
const commentController = new CommentController();

// Get comments for an event (public, but shows like status if authenticated)
router.get(
  '/events/:eventId/comments',
  optionalAuth,
  commentController.getComments
);

// Create a comment (requires auth)
router.post(
  '/events/:eventId/comments',
  authenticate,
  commentController.createComment
);

// Update a comment (requires auth)
router.put(
  '/comments/:commentId',
  authenticate,
  commentController.updateComment
);

// Delete a comment (requires auth)
router.delete(
  '/comments/:commentId',
  authenticate,
  commentController.deleteComment
);

// Toggle like on a comment (requires auth)
router.post(
  '/comments/:commentId/like',
  authenticate,
  commentController.toggleLike
);

export default router;

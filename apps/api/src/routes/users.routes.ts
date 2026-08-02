import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { UsersController } from '../controllers/users.controller.js';

const router = Router();
const usersController = new UsersController();

router.get(
  '/me/subscriptions',
  authenticate,
  usersController.getSubscriptions
);
router.post(
  '/me/subscriptions',
  authenticate,
  usersController.addSubscription
);
router.delete(
  '/me/subscriptions/:categoryId',
  authenticate,
  usersController.removeSubscription
);
router.get(
  '/me/notification-settings',
  authenticate,
  usersController.getNotificationSettings
);
router.put(
  '/me/notification-settings',
  authenticate,
  usersController.updateNotificationSettings
);
router.get('/unsubscribe', usersController.unsubscribeGeneric);

export default router;

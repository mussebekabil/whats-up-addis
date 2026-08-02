import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { usersService } from '../services/users.service.js';
import {
  addSubscriptionSchema,
  updateNotificationSettingsSchema,
} from '@whats-up-addis/shared';
import { AppError } from '../middleware/error-handler.js';
import type { AuthRequest } from '../middleware/auth.js';

export class UsersController {
  getSubscriptions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const subscriptions = await usersService.getUserSubscriptions(
        req.user!.id
      );
      res.json({ subscriptions });
    } catch (error) {
      next(error);
    }
  };

  addSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { categoryId } = addSubscriptionSchema.parse(req.body);
      const subscription = await usersService.addSubscription(
        req.user!.id,
        categoryId
      );
      res.status(201).json({ subscription });
    } catch (error) {
      next(error);
    }
  };

  removeSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { categoryId } = z
        .object({ categoryId: z.string().uuid() })
        .parse(req.params);
      await usersService.removeSubscription(req.user!.id, categoryId);
      res.json({ message: 'Subscription removed' });
    } catch (error) {
      next(error);
    }
  };

  getNotificationSettings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const settings = await usersService.getNotificationSettings(req.user!.id);
      res.json({ settings });
    } catch (error) {
      next(error);
    }
  };

  updateNotificationSettings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = updateNotificationSettingsSchema.parse(req.body);
      const settings = await usersService.updateNotificationSettings(
        req.user!.id,
        data
      );
      res.json({ settings });
    } catch (error) {
      next(error);
    }
  };

  unsubscribeGeneric = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token } = req.query as { token?: string };
      if (!token) throw new AppError(400, 'Missing token');

      await usersService.processUnsubscribeToken(token);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      res.redirect(`${appUrl}/profile?tab=notifications&unsubscribed=1`);
    } catch (error) {
      next(error);
    }
  };
}

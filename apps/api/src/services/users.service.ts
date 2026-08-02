import { prisma } from '@whats-up-addis/database';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error-handler.js';
import type { UpdateNotificationSettingsInput } from '@whats-up-addis/shared';

export class UsersService {
  async getUserSubscriptions(userId: string) {
    return prisma.userCategorySubscription.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addSubscription(userId: string, categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new AppError(404, 'Category not found');

    const existing = await prisma.userCategorySubscription.findUnique({
      where: { userId_categoryId: { userId, categoryId } },
    });
    if (existing)
      throw new AppError(409, 'Already subscribed to this category');

    return prisma.userCategorySubscription.create({
      data: { userId, categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    });
  }

  async removeSubscription(userId: string, categoryId: string) {
    const existing = await prisma.userCategorySubscription.findUnique({
      where: { userId_categoryId: { userId, categoryId } },
    });
    if (!existing) throw new AppError(404, 'Subscription not found');

    await prisma.userCategorySubscription.delete({
      where: { userId_categoryId: { userId, categoryId } },
    });
  }

  async getNotificationSettings(userId: string) {
    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
    });
    if (settings) return settings;

    return prisma.userNotificationSettings.create({
      data: { userId },
    });
  }

  async updateNotificationSettings(
    userId: string,
    data: UpdateNotificationSettingsInput
  ) {
    return prisma.userNotificationSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  generateUnsubscribeToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');
    return jwt.sign({ userId, type: 'generic_unsubscribe' }, secret);
  }

  async processUnsubscribeToken(token: string): Promise<void> {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');

    let payload: { userId: string; type: string };
    try {
      payload = jwt.verify(token, secret) as { userId: string; type: string };
    } catch {
      throw new AppError(400, 'Invalid or malformed unsubscribe token');
    }

    if (payload.type !== 'generic_unsubscribe') {
      throw new AppError(400, 'Invalid token type');
    }

    await this.updateNotificationSettings(payload.userId, {
      genericEmailOptOut: true,
    });
  }
}

export const usersService = new UsersService();

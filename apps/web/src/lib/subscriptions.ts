import { api } from './api';
import { authService } from './auth';
import type {
  UserSubscription,
  NotificationSettings,
  DigestFrequency,
} from '@whats-up-addis/shared';

function getToken(): string {
  const token = authService.getToken();
  if (!token) throw new Error('Not authenticated');
  return token;
}

export const subscriptionService = {
  async getSubscriptions(): Promise<UserSubscription[]> {
    const res = await api.get<{ subscriptions: UserSubscription[] }>(
      '/api/users/me/subscriptions',
      getToken()
    );
    return res.subscriptions;
  },

  async addSubscription(categoryId: string): Promise<UserSubscription> {
    const res = await api.post<{ subscription: UserSubscription }>(
      '/api/users/me/subscriptions',
      { categoryId },
      getToken()
    );
    return res.subscription;
  },

  async removeSubscription(categoryId: string): Promise<void> {
    await api.delete<{ message: string }>(
      `/api/users/me/subscriptions/${categoryId}`,
      getToken()
    );
  },

  async getNotificationSettings(): Promise<NotificationSettings> {
    const res = await api.get<{ settings: NotificationSettings }>(
      '/api/users/me/notification-settings',
      getToken()
    );
    return res.settings;
  },

  async updateNotificationSettings(data: {
    digestFrequency?: DigestFrequency;
    genericEmailOptOut?: boolean;
  }): Promise<NotificationSettings> {
    const res = await api.put<{ settings: NotificationSettings }>(
      '/api/users/me/notification-settings',
      data,
      getToken()
    );
    return res.settings;
  },
};

import { api } from './api';
import { authService } from './auth';
import type { EventRatingStats, CreateRatingInput } from '@whats-up-addis/shared';

export const ratingService = {
  async getRatingStats(eventId: string): Promise<EventRatingStats> {
    const token = authService.getToken();
    return api.get<EventRatingStats>(`/api/events/${eventId}/ratings`, token || undefined);
  },

  async createOrUpdateRating(eventId: string, data: CreateRatingInput): Promise<{ message?: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return api.post<{ message?: string }>(`/api/events/${eventId}/ratings`, data, token);
  },

  async deleteRating(eventId: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return api.delete<{ message: string }>(`/api/events/${eventId}/ratings`, token);
  },
};

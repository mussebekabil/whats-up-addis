import { api } from './api';
import { authService } from './auth';
import type {
  PlaceRatingStats,
  CreateRatingInput,
} from '@whats-up-addis/shared';

export const placeRatingService = {
  async getRatingStats(placeId: string): Promise<PlaceRatingStats> {
    const token = authService.getToken();
    return api.get<PlaceRatingStats>(
      `/api/places/${placeId}/ratings`,
      token || undefined
    );
  },

  async createOrUpdateRating(
    placeId: string,
    data: CreateRatingInput
  ): Promise<PlaceRatingStats> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return api.post<PlaceRatingStats>(
      `/api/places/${placeId}/ratings`,
      data,
      token
    );
  },
};

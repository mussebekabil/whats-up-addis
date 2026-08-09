import { api } from './api';
import { authService } from './auth';
import type { PlaceComment } from '@whats-up-addis/shared';

export const placeCommentService = {
  async getComments(placeId: string): Promise<PlaceComment[]> {
    const token = authService.getToken();
    return api.get<PlaceComment[]>(
      `/api/places/${placeId}/comments`,
      token || undefined
    );
  },

  async createComment(
    placeId: string,
    data: { content: string; parentCommentId?: string }
  ): Promise<PlaceComment> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return api.post<PlaceComment>(
      `/api/places/${placeId}/comments`,
      data,
      token
    );
  },

  async toggleLike(
    placeId: string,
    commentId: string
  ): Promise<{ liked: boolean; message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return api.post<{ liked: boolean; message: string }>(
      `/api/places/${placeId}/comments/${commentId}/like`,
      {},
      token
    );
  },

  async deleteComment(
    placeId: string,
    commentId: string
  ): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return api.delete<{ message: string }>(
      `/api/places/${placeId}/comments/${commentId}`,
      token
    );
  },
};

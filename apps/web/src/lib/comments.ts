import { api } from './api';
import { authService } from './auth';
import type { Comment, CreateCommentInput, UpdateCommentInput } from '@whats-up-addis/shared';

export const commentService = {
  async getComments(eventId: string): Promise<Comment[]> {
    const token = authService.getToken();
    return api.get<Comment[]>(`/api/events/${eventId}/comments`, token || undefined);
  },

  async createComment(eventId: string, data: CreateCommentInput): Promise<Comment> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return api.post<Comment>(`/api/events/${eventId}/comments`, data, token);
  },

  async updateComment(commentId: string, data: UpdateCommentInput): Promise<Comment> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return api.put<Comment>(`/api/comments/${commentId}`, data, token);
  },

  async deleteComment(commentId: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return api.delete<{ message: string }>(`/api/comments/${commentId}`, token);
  },

  async toggleLike(commentId: string): Promise<{ liked: boolean; message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return api.post<{ liked: boolean; message: string }>(`/api/comments/${commentId}/like`, {}, token);
  },
};

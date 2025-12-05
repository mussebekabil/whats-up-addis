import { api } from './api';
import type { Category } from '@whats-up-addis/shared';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return api.get<Category[]>('/api/categories');
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    return api.get<Category>(`/api/categories/${slug}`);
  },

  async getEventsByCategory(slug: string, page = 1, limit = 20) {
    return api.get(
      `/api/categories/${slug}/events?page=${page}&limit=${limit}`
    );
  },
};

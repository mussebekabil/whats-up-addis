import { api } from './api';
import { authService } from './auth';
import type {
  Event,
  PaginatedResponse,
  CreateEventInput,
  UpdateEventInput,
  EventFiltersInput,
} from '@whats-up-addis/shared';

export const eventService = {
  async getEvents(
    filters?: EventFiltersInput
  ): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/events?${queryString}` : '/api/events';

    return api.get<PaginatedResponse<Event>>(endpoint);
  },

  async getEventById(id: string): Promise<Event> {
    return api.get<Event>(`/api/events/${id}`);
  },

  async createEvent(data: CreateEventInput): Promise<Event> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return api.post<Event>('/api/events', data, token);
  },

  async updateEvent(id: string, data: UpdateEventInput): Promise<Event> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return api.put<Event>(`/api/events/${id}`, data, token);
  },

  async deleteEvent(id: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return api.delete<{ message: string }>(`/api/events/${id}`, token);
  },

  async searchEvents(
    query: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Event>> {
    return api.get<PaginatedResponse<Event>>(
      `/api/events/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  },
};

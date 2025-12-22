import { api } from './api';
import { EventStatus } from '@whats-up-addis/shared';

export interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  venue?: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  price?: number;
  source: string;
  sourceUrl?: string;
  categoryId: string;
  createdBy?: string;
  isActive: boolean;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    id: string;
    tag: string;
  }>;
}

export interface EventsResponse {
  data: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminApi = {
  async getEvents(
    token: string,
    page = 1,
    limit = 20,
    status?: EventStatus
  ): Promise<EventsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append('status', status);
    }
    return api.get<EventsResponse>(
      `/api/admin/events?${params.toString()}`,
      token
    );
  },

  async updateEventStatus(
    eventId: string,
    status: EventStatus,
    token: string
  ): Promise<Event> {
    return api.patch<Event>(
      `/api/admin/events/${eventId}/status`,
      { status },
      token
    );
  },
};

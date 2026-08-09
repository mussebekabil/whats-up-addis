import { api } from './api';
import type {
  Place,
  PaginatedResponse,
  PlaceFiltersInput,
} from '@whats-up-addis/shared';

export const placeService = {
  async getPlaces(
    filters?: PlaceFiltersInput
  ): Promise<PaginatedResponse<Place>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/places?${queryString}` : '/api/places';

    return api.get<PaginatedResponse<Place>>(endpoint);
  },

  async getPlaceById(id: string): Promise<Place> {
    return api.get<Place>(`/api/places/${id}`);
  },
};

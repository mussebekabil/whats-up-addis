import { api } from './api';
import type { ContactInput } from '@whats-up-addis/shared';

export const contactService = {
  async submit(data: ContactInput): Promise<{ message: string }> {
    return api.post<{ message: string }>('/api/contact', data);
  },
};

import { api } from './api';
import type { AuthResponse, User } from '@whats-up-addis/shared';

const TOKEN_KEY = 'whats-up-addis-token';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, response.tokens.accessToken);
    }

    return response;
  },

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      email,
      password,
      name,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, response.tokens.accessToken);
    }

    return response;
  },

  async getMe(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    return api.get<User>('/api/auth/me', token);
  },

  async getAllUsers(): Promise<User[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    return api.get<User[]>('/api/auth/users', token);
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

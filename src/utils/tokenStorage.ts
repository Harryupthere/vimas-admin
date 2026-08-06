import type { AdminUser } from '../types/auth.types';

const ACCESS_TOKEN_KEY = 'vimas_admin_access_token';
const REFRESH_TOKEN_KEY = 'vimas_admin_refresh_token';
const ADMIN_KEY = 'vimas_admin_user';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  getAdmin: (): AdminUser | null => {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminUser;
    } catch {
      return null;
    }
  },

  setAdmin: (admin: AdminUser) => {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },

  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },
};

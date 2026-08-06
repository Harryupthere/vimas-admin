import axios, { type AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { tokenStorage } from '../utils/tokenStorage';
import { API_ENDPOINTS } from './endpoints';
import type { ApiEnvelope, ApiError, ServiceResult } from '../types/api.types';

const baseURL = import.meta.env.VITE_API_URL as string;

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

// ─── Request interceptor: attach JWT ──────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Silent token refresh ───────────────────────────────────────────
// POST /admin/refresh-token exists on the backend (Backend/src/admin/admin.controller.ts),
// so a 401 gets one retry with a fresh access token before we give up and log out.
// Uses a bare `axios` call (not `apiClient`) so this request never re-enters
// these same interceptors.
let refreshPromise: Promise<string> | null = null;

async function attemptTokenRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await axios.post<ApiEnvelope<ServiceResult<{ access_token: string; refresh_token: string }>>>(
        `${baseURL}${API_ENDPOINTS.adminRefreshToken}`,
        { refreshToken },
      );

      const tokens = response.data.data.data;
      if (!tokens?.access_token) throw new Error('Refresh response missing access_token');

      tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
      return tokens.access_token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Response interceptor: 401 -> refresh-and-retry once, else logout ──
let hasShownSessionExpired = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status ?? null;
    const message: string =
      error?.response?.data?.message || error?.response?.data?.error || 'Something went wrong';
    const originalRequest = error?.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes(API_ENDPOINTS.adminLogin) ||
      originalRequest?.url?.includes(API_ENDPOINTS.adminRefreshToken);

    if (status === 401 && !isAuthEndpoint && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        const newAccessToken = await attemptTokenRefresh();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch {
        if (!hasShownSessionExpired) {
          hasShownSessionExpired = true;
          toast.error('Your session has expired. Please log in again.');
        }
        tokenStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (!isAuthEndpoint) {
      // Login page renders its own inline error instead of a toast.
      toast.error(message);
    }

    const apiError: ApiError = { status, message };
    return Promise.reject(apiError);
  },
);

// ─── Envelope helpers ──────────────────────────────────────────────
// See types/api.types.ts for what these encode and why there isn't one
// generic list-normalizer — resource shapes genuinely differ backend-side.

/** Strips the one layer every response is guaranteed to have (the global
 *  NestJS interceptor). What's left is resource-specific. */
export function unwrapEnvelope<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  return response.data.data;
}

/** For the common case where the service layer also wraps as `{ data, message }`. */
export function unwrapData<T>(response: AxiosResponse<ApiEnvelope<ServiceResult<T>>>): T {
  return unwrapEnvelope(response).data;
}

/** The response interceptor above always rejects with an ApiError object,
 *  but TanStack Query/catch blocks type caught errors as `unknown` (or
 *  `Error` by default) — this is the one place that cast happens, instead
 *  of every call site doing `err as unknown as ApiError`. */
export function toApiError(err: unknown): ApiError {
  const candidate = err as Partial<ApiError> | undefined;
  return {
    status: candidate?.status ?? null,
    message: candidate?.message || 'Something went wrong',
  };
}

import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type { ChangePasswordRequest, LoginPayload, LoginRequest } from '../types/auth.types';

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginPayload> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<LoginPayload>>>(
      API_ENDPOINTS.adminLogin,
      payload,
    );
    return unwrapData(response);
  },

  // AdminService.changePassword() returns only `{ message }` — no `data` key —
  // so there's nothing to unwrap, just let a non-2xx reject via the interceptor.
  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.adminChangePassword, payload);
  },
};

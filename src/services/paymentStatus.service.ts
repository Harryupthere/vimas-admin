import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreatePaymentStatusRequest,
  PaymentStatus,
  UpdatePaymentStatusRequest,
} from '../types/paymentStatus.types';

export const paymentStatusService = {
  list: async (): Promise<PaymentStatus[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<PaymentStatus[]>>>(
      API_ENDPOINTS.adminPaymentStatus,
    );
    return unwrapData(response);
  },

  create: async (payload: CreatePaymentStatusRequest): Promise<PaymentStatus> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<PaymentStatus>>>(
      API_ENDPOINTS.adminPaymentStatus,
      payload,
    );
    return unwrapData(response);
  },

  update: async (id: number, payload: UpdatePaymentStatusRequest): Promise<PaymentStatus> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<PaymentStatus>>>(
      buildUrl(API_ENDPOINTS.adminPaymentStatusById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminPaymentStatusById, { id }));
  },
};

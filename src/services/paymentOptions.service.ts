import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreatePaymentOptionRequest,
  PaymentOption,
  UpdatePaymentOptionRequest,
} from '../types/paymentOption.types';

export const paymentOptionsService = {
  list: async (): Promise<PaymentOption[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<PaymentOption[]>>>(
      API_ENDPOINTS.adminPaymentOptions,
    );
    return unwrapData(response);
  },

  create: async (payload: CreatePaymentOptionRequest): Promise<PaymentOption> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<PaymentOption>>>(
      API_ENDPOINTS.adminPaymentOptions,
      payload,
    );
    return unwrapData(response);
  },

  // NOTE: PaymentOptionsService.update() (backend) returns `data: this.findOne(id)`
  // without awaiting the promise, so the response body's `data` is useless —
  // the update itself still applies. We refetch the list afterward instead of
  // trusting this call's return value.
  update: async (id: number, payload: UpdatePaymentOptionRequest): Promise<void> => {
    await apiClient.put(buildUrl(API_ENDPOINTS.adminPaymentOptionById, { id }), payload);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminPaymentOptionById, { id }));
  },
};

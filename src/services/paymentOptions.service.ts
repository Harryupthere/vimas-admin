import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreatePaymentOptionRequest,
  PaymentOption,
  PaymentOptionListParams,
  UpdatePaymentOptionRequest,
} from '../types/paymentOption.types';

export const paymentOptionsService = {
  list: async (params: PaymentOptionListParams = {}): Promise<PaymentOption[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<PaymentOption[]>>>(
      buildUrl(API_ENDPOINTS.adminPaymentOptions, params),
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

  // PaymentOptionsService.update() now correctly awaits and returns the
  // saved row (the earlier un-awaited-promise bug here has been fixed
  // server-side), so this is a normal PUT + real response.
  update: async (id: number, payload: UpdatePaymentOptionRequest): Promise<PaymentOption> => {
    const response = await apiClient.put<ApiEnvelope<ServiceResult<PaymentOption>>>(
      buildUrl(API_ENDPOINTS.adminPaymentOptionById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminPaymentOptionById, { id }));
  },
};

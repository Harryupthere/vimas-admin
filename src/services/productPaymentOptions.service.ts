import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type { CreateProductPaymentOptionRequest, ProductPaymentOption } from '../types/productPaymentOption.types';

// See productPaymentOption.types.ts for why there's no list/get here —
// mapped rows only ever arrive embedded in a product's own fetch.
export const productPaymentOptionsService = {
  create: async (payload: CreateProductPaymentOptionRequest): Promise<ProductPaymentOption> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<ProductPaymentOption>>>(
      API_ENDPOINTS.adminProductPaymentOption,
      payload,
    );
    return unwrapData(response);
  },

  // `id` is the product_payment_options row's own id (from the mapping
  // embedded in the product's `paymentOptions` relation), not product_id.
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminProductPaymentOptionById, { id }));
  },
};

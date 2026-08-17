import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreateProductAddOnRequest,
  ProductAddOn,
  ProductAddOnListParams,
  UpdateProductAddOnRequest,
} from '../types/productAddOn.types';

export const productAddOnsService = {
  list: async (params: ProductAddOnListParams = {}): Promise<ProductAddOn[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<ProductAddOn[]>>>(
      buildUrl(API_ENDPOINTS.adminProductAddOns, params),
    );
    return unwrapData(response);
  },

  getById: async (id: number): Promise<ProductAddOn> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<ProductAddOn>>>(
      buildUrl(API_ENDPOINTS.adminProductAddOnById, { id }),
    );
    return unwrapData(response);
  },

  create: async (payload: CreateProductAddOnRequest): Promise<ProductAddOn> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<ProductAddOn>>>(
      API_ENDPOINTS.adminProductAddOns,
      payload,
    );
    return unwrapData(response);
  },

  update: async (id: number, payload: UpdateProductAddOnRequest): Promise<ProductAddOn> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<ProductAddOn>>>(
      buildUrl(API_ENDPOINTS.adminProductAddOnById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminProductAddOnById, { id }));
  },
};

import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreateProductExtraChargeRequest,
  ProductExtraCharge,
  ProductExtraChargeListParams,
  UpdateProductExtraChargeRequest,
} from '../types/productExtraCharge.types';

export const productExtraChargesService = {
  list: async (params: ProductExtraChargeListParams = {}): Promise<ProductExtraCharge[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<ProductExtraCharge[]>>>(
      buildUrl(API_ENDPOINTS.adminProductExtraCharges, params),
    );
    return unwrapData(response);
  },

  getById: async (id: number): Promise<ProductExtraCharge> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<ProductExtraCharge>>>(
      buildUrl(API_ENDPOINTS.adminProductExtraChargeById, { id }),
    );
    return unwrapData(response);
  },

  create: async (payload: CreateProductExtraChargeRequest): Promise<ProductExtraCharge> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<ProductExtraCharge>>>(
      API_ENDPOINTS.adminProductExtraCharges,
      payload,
    );
    return unwrapData(response);
  },

  update: async (id: number, payload: UpdateProductExtraChargeRequest): Promise<ProductExtraCharge> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<ProductExtraCharge>>>(
      buildUrl(API_ENDPOINTS.adminProductExtraChargeById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminProductExtraChargeById, { id }));
  },
};

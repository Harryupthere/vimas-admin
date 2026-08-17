import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreateProductDiscountRequest,
  ProductDiscount,
  ProductDiscountListParams,
  UpdateProductDiscountRequest,
} from '../types/productDiscount.types';

export const productDiscountsService = {
  list: async (params: ProductDiscountListParams = {}): Promise<ProductDiscount[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<ProductDiscount[]>>>(
      buildUrl(API_ENDPOINTS.adminProductDiscounts, params),
    );
    return unwrapData(response);
  },

  getById: async (id: number): Promise<ProductDiscount> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<ProductDiscount>>>(
      buildUrl(API_ENDPOINTS.adminProductDiscountById, { id }),
    );
    return unwrapData(response);
  },

  create: async (payload: CreateProductDiscountRequest): Promise<ProductDiscount> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<ProductDiscount>>>(
      API_ENDPOINTS.adminProductDiscounts,
      payload,
    );
    return unwrapData(response);
  },

  update: async (id: number, payload: UpdateProductDiscountRequest): Promise<ProductDiscount> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<ProductDiscount>>>(
      buildUrl(API_ENDPOINTS.adminProductDiscountById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminProductDiscountById, { id }));
  },
};

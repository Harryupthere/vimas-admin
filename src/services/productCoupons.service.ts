import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreateProductCouponRequest,
  ProductCoupon,
  ProductCouponListParams,
  UpdateProductCouponRequest,
} from '../types/productCoupon.types';

export const productCouponsService = {
  list: async (params: ProductCouponListParams = {}): Promise<ProductCoupon[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<ProductCoupon[]>>>(
      buildUrl(API_ENDPOINTS.adminProductCoupons, params),
    );
    return unwrapData(response);
  },

  getById: async (id: number): Promise<ProductCoupon> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<ProductCoupon>>>(
      buildUrl(API_ENDPOINTS.adminProductCouponById, { id }),
    );
    return unwrapData(response);
  },

  create: async (payload: CreateProductCouponRequest): Promise<ProductCoupon> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<ProductCoupon>>>(
      API_ENDPOINTS.adminProductCoupons,
      payload,
    );
    return unwrapData(response);
  },

  update: async (id: number, payload: UpdateProductCouponRequest): Promise<ProductCoupon> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<ProductCoupon>>>(
      buildUrl(API_ENDPOINTS.adminProductCouponById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminProductCouponById, { id }));
  },
};

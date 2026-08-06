import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type { ProductMedia } from '../types/product.types';

export interface CreateProductMediaRequest {
  product_id: number;
  media_url: string;
  media_type?: 'image' | 'video';
  sort_order?: number;
}

export const productMediaService = {
  create: async (payload: CreateProductMediaRequest): Promise<ProductMedia> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<ProductMedia>>>(
      API_ENDPOINTS.adminProductMedia,
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminProductMediaById, { id }));
  },
};

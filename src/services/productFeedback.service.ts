import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  ProductFeedback,
  ProductFeedbackListParams,
  SetFeedbackStatusRequest,
} from '../types/productFeedback.types';

interface ProductFeedbackListPayload {
  feedback: ProductFeedback[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const productFeedbackService = {
  list: async (params: ProductFeedbackListParams = {}): Promise<PaginatedResult<ProductFeedback>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: ProductFeedbackListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminProductFeedback, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.feedback,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  setStatus: async (id: number, payload: SetFeedbackStatusRequest): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminProductFeedbackStatus, { id }), payload);
  },

  // Hard delete — cascades to replies and likes (per the Postman description).
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminProductFeedbackById, { id }));
  },
};

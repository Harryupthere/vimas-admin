import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type { ProductHistory, ProductHistoryListParams } from '../types/productHistory.types';

interface ProductHistoryListPayload {
  history: ProductHistory[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const productHistoryService = {
  list: async (params: ProductHistoryListParams = {}): Promise<PaginatedResult<ProductHistory>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: ProductHistoryListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminProductHistory, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.history,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },
};

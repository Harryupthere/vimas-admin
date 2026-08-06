import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreatePointPoolRequest,
  PointPool,
  PointPoolListParams,
  UpdatePointPoolRequest,
} from '../types/pointPool.types';

interface PointPoolListPayload {
  pools: PointPool[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const pointPoolService = {
  list: async (params: PointPoolListParams = {}): Promise<PaginatedResult<PointPool>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: PointPoolListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminPointPool, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.pools,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  create: async (payload: CreatePointPoolRequest): Promise<PointPool> => {
    const response = await apiClient.post<ApiEnvelope<{ data: PointPool; message: string }>>(
      API_ENDPOINTS.adminPointPool,
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  update: async (id: number, payload: UpdatePointPoolRequest): Promise<PointPool> => {
    const response = await apiClient.patch<ApiEnvelope<{ data: PointPool; message: string }>>(
      buildUrl(API_ENDPOINTS.adminPointPoolById, { id }),
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminPointPoolById, { id }));
  },
};

import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreateRewardMallProductRequest,
  RewardMallProduct,
  RewardMallProductListParams,
  UpdateRewardMallProductRequest,
} from '../types/rewardMallProduct.types';

// RewardMallProductsService.findAll() nests { products, page, limit, total, total_pages } inside `data`.
interface RewardMallProductsListPayload {
  products: RewardMallProduct[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const rewardMallProductsService = {
  list: async (params: RewardMallProductListParams = {}): Promise<PaginatedResult<RewardMallProduct>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: RewardMallProductsListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminRewardMallProducts, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.products,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  getById: async (id: number): Promise<RewardMallProduct> => {
    const response = await apiClient.get<ApiEnvelope<{ data: RewardMallProduct; message: string }>>(
      buildUrl(API_ENDPOINTS.adminRewardMallProductById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  create: async (payload: CreateRewardMallProductRequest): Promise<RewardMallProduct> => {
    const response = await apiClient.post<ApiEnvelope<{ data: RewardMallProduct; message: string }>>(
      API_ENDPOINTS.adminRewardMallProducts,
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  update: async (id: number, payload: UpdateRewardMallProductRequest): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminRewardMallProductById, { id }), payload);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminRewardMallProductById, { id }));
  },
};

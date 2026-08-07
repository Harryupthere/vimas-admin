import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  AdminUpdateRewardMallPurchaseRequest,
  RewardMallPurchase,
  RewardMallPurchaseListParams,
} from '../types/rewardMallPurchase.types';

// RewardMallPurchasesService.findAll() nests { purchases, page, limit, total, total_pages } inside `data`.
interface RewardMallPurchasesListPayload {
  purchases: RewardMallPurchase[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Admin can only read + update fulfilment fields here — no create/delete
// endpoints exist (purchases are created exclusively by buyers redeeming
// points, via the user-side API).
export const rewardMallPurchasesService = {
  list: async (params: RewardMallPurchaseListParams = {}): Promise<PaginatedResult<RewardMallPurchase>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: RewardMallPurchasesListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminRewardMallPurchases, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.purchases,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  getById: async (id: number): Promise<RewardMallPurchase> => {
    const response = await apiClient.get<ApiEnvelope<{ data: RewardMallPurchase; message: string }>>(
      buildUrl(API_ENDPOINTS.adminRewardMallPurchaseById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  update: async (id: number, payload: AdminUpdateRewardMallPurchaseRequest): Promise<RewardMallPurchase> => {
    const response = await apiClient.patch<ApiEnvelope<{ data: RewardMallPurchase; message: string }>>(
      buildUrl(API_ENDPOINTS.adminRewardMallPurchaseById, { id }),
      payload,
    );
    return unwrapEnvelope(response).data;
  },
};

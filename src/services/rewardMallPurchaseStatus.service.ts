import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreateRewardMallPurchaseStatusRequest,
  RewardMallPurchaseStatus,
  UpdateRewardMallPurchaseStatusRequest,
} from '../types/rewardMallPurchaseStatus.types';

export const rewardMallPurchaseStatusService = {
  list: async (): Promise<RewardMallPurchaseStatus[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<RewardMallPurchaseStatus[]>>>(
      API_ENDPOINTS.adminRewardMallPurchaseStatus,
    );
    return unwrapData(response);
  },

  create: async (payload: CreateRewardMallPurchaseStatusRequest): Promise<RewardMallPurchaseStatus> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<RewardMallPurchaseStatus>>>(
      API_ENDPOINTS.adminRewardMallPurchaseStatus,
      payload,
    );
    return unwrapData(response);
  },

  update: async (id: number, payload: UpdateRewardMallPurchaseStatusRequest): Promise<RewardMallPurchaseStatus> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<RewardMallPurchaseStatus>>>(
      buildUrl(API_ENDPOINTS.adminRewardMallPurchaseStatusById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  // Throws a 409 ConflictException if reward mall purchases still reference
  // this status — surfaces automatically as a toast via the interceptor.
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminRewardMallPurchaseStatusById, { id }));
  },
};

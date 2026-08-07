import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreateRewardMallCategoryRequest,
  RewardMallCategory,
  UpdateRewardMallCategoryRequest,
} from '../types/rewardMallCategory.types';

export const rewardMallCategoriesService = {
  list: async (status?: number): Promise<RewardMallCategory[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<RewardMallCategory[]>>>(
      buildUrl(API_ENDPOINTS.adminRewardMallCategories, { status }),
    );
    return unwrapData(response);
  },

  create: async (payload: CreateRewardMallCategoryRequest): Promise<RewardMallCategory> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<RewardMallCategory>>>(
      API_ENDPOINTS.adminRewardMallCategories,
      payload,
    );
    return unwrapData(response);
  },

  update: async (id: number, payload: UpdateRewardMallCategoryRequest): Promise<RewardMallCategory> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<RewardMallCategory>>>(
      buildUrl(API_ENDPOINTS.adminRewardMallCategoryById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  // Throws a 409 ConflictException if reward mall products still reference
  // this category — surfaces automatically as a toast via the interceptor.
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminRewardMallCategoryById, { id }));
  },
};

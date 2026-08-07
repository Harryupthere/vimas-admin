import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type { RewardMallProductMedia } from '../types/rewardMallProduct.types';

export interface CreateRewardMallProductMediaRequest {
  rewardMallProductId: number;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  sortOrder?: number;
}

export type UpdateRewardMallProductMediaRequest = Partial<CreateRewardMallProductMediaRequest>;

export const rewardMallProductMediaService = {
  create: async (payload: CreateRewardMallProductMediaRequest): Promise<RewardMallProductMedia> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<RewardMallProductMedia>>>(
      API_ENDPOINTS.adminRewardMallProductMedia,
      payload,
    );
    return unwrapData(response);
  },

  // Used for reordering (sortOrder) as well as any other field edit.
  update: async (id: number, payload: UpdateRewardMallProductMediaRequest): Promise<RewardMallProductMedia> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<RewardMallProductMedia>>>(
      buildUrl(API_ENDPOINTS.adminRewardMallProductMediaById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminRewardMallProductMediaById, { id }));
  },
};

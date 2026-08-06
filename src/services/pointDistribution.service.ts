import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreatePointDistributionRequest,
  PointDistribution,
  PointDistributionStatus,
  UpdatePointDistributionRequest,
} from '../types/pointDistribution.types';

export const pointDistributionService = {
  list: async (status?: PointDistributionStatus): Promise<PointDistribution[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<PointDistribution[]>>>(
      buildUrl(API_ENDPOINTS.adminPointDistribution, { status }),
    );
    return unwrapData(response);
  },

  create: async (payload: CreatePointDistributionRequest): Promise<PointDistribution> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<PointDistribution>>>(
      API_ENDPOINTS.adminPointDistribution,
      payload,
    );
    return unwrapData(response);
  },

  update: async (id: number, payload: UpdatePointDistributionRequest): Promise<PointDistribution> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<PointDistribution>>>(
      buildUrl(API_ENDPOINTS.adminPointDistributionById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminPointDistributionById, { id }));
  },
};

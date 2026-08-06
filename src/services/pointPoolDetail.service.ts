import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreatePointPoolDetailRequest,
  PointPoolDetail,
  PointPoolDetailStatus,
  UpdatePointPoolDetailRequest,
} from '../types/pointPoolDetail.types';

export const pointPoolDetailService = {
  list: async (status?: PointPoolDetailStatus): Promise<PointPoolDetail[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<PointPoolDetail[]>>>(
      buildUrl(API_ENDPOINTS.adminPointPoolDetail, { status }),
    );
    return unwrapData(response);
  },

  create: async (payload: CreatePointPoolDetailRequest): Promise<PointPoolDetail> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<PointPoolDetail>>>(
      API_ENDPOINTS.adminPointPoolDetail,
      payload,
    );
    return unwrapData(response);
  },

  update: async (id: number, payload: UpdatePointPoolDetailRequest): Promise<PointPoolDetail> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<PointPoolDetail>>>(
      buildUrl(API_ENDPOINTS.adminPointPoolDetailById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminPointPoolDetailById, { id }));
  },
};

import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type { CreateOrderStatusRequest, OrderStatus, UpdateOrderStatusRequest } from '../types/orderStatus.types';

export const orderStatusService = {
  list: async (): Promise<OrderStatus[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<OrderStatus[]>>>(API_ENDPOINTS.adminOrderStatus);
    return unwrapData(response);
  },

  create: async (payload: CreateOrderStatusRequest): Promise<OrderStatus> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<OrderStatus>>>(
      API_ENDPOINTS.adminOrderStatus,
      payload,
    );
    return unwrapData(response);
  },

  update: async (id: number, payload: UpdateOrderStatusRequest): Promise<OrderStatus> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<OrderStatus>>>(
      buildUrl(API_ENDPOINTS.adminOrderStatusById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  // OrderStatusService.remove() throws ConflictException if the status is
  // still referenced by existing orders — surfaces as a toast via the
  // response interceptor, nothing special needed here.
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminOrderStatusById, { id }));
  },
};

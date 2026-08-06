import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type { Order, OrderListParams, UpdateOrderStatusRequest } from '../types/order.types';

// OrdersService.findAll() nests { orders, page, limit, total, total_pages } inside `data`.
interface OrdersListPayload {
  orders: Order[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const ordersService = {
  list: async (params: OrderListParams = {}): Promise<PaginatedResult<Order>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: OrdersListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminOrders, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.orders,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  getById: async (id: number): Promise<Order> => {
    const response = await apiClient.get<ApiEnvelope<{ data: Order; message: string }>>(
      buildUrl(API_ENDPOINTS.adminOrderById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  updateStatus: async (id: number, payload: UpdateOrderStatusRequest): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminOrderStatusUpdate, { id }), payload);
  },
};

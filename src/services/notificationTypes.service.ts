import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreateNotificationTypeRequest,
  NotificationType,
  NotificationTypeListParams,
  UpdateNotificationTypeRequest,
} from '../types/notificationType.types';

// NotificationTypesService.findAll() nests { types, page, limit, total, total_pages } inside `data`.
interface NotificationTypesListPayload {
  types: NotificationType[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const notificationTypesService = {
  list: async (params: NotificationTypeListParams = {}): Promise<PaginatedResult<NotificationType>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: NotificationTypesListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminNotificationTypes, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.types,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  create: async (payload: CreateNotificationTypeRequest): Promise<NotificationType> => {
    const response = await apiClient.post<ApiEnvelope<{ data: NotificationType; message: string }>>(
      API_ENDPOINTS.adminNotificationTypes,
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  update: async (id: number, payload: UpdateNotificationTypeRequest): Promise<NotificationType> => {
    const response = await apiClient.patch<ApiEnvelope<{ data: NotificationType; message: string }>>(
      buildUrl(API_ENDPOINTS.adminNotificationTypeById, { id }),
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  // Throws a 409 ConflictException if notifications still reference this
  // type — surfaces automatically as a toast via the interceptor.
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminNotificationTypeById, { id }));
  },
};

import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreateNotificationRequest,
  Notification,
  NotificationListParams,
  UpdateNotificationRequest,
} from '../types/notification.types';

// NotificationsService.adminFindAll() nests { notifications, page, limit, total, total_pages } inside `data`.
interface NotificationsListPayload {
  notifications: Notification[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const notificationsService = {
  list: async (params: NotificationListParams = {}): Promise<PaginatedResult<Notification>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: NotificationsListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminNotifications, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.notifications,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  getById: async (id: number): Promise<Notification> => {
    const response = await apiClient.get<ApiEnvelope<{ data: Notification; message: string }>>(
      buildUrl(API_ENDPOINTS.adminNotificationById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  // adminCreate() only returns the saved row for a single-user send —
  // a broadcast returns `{ message }` only (it fans out to one row per
  // active user server-side, so there's no single record to hand back).
  // Neither the Send modal nor its caller need the response body, so this
  // is typed void either way.
  create: async (payload: CreateNotificationRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.adminNotifications, payload);
  },

  update: async (id: number, payload: UpdateNotificationRequest): Promise<Notification> => {
    const response = await apiClient.patch<ApiEnvelope<{ data: Notification; message: string }>>(
      buildUrl(API_ENDPOINTS.adminNotificationById, { id }),
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  // Admin-side "archive" — hides it from the admin list without touching
  // the target user's own view of it.
  hide: async (id: number): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminNotificationHide, { id }));
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminNotificationById, { id }));
  },
};

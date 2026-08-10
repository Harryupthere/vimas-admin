import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreateNotificationCategoryRequest,
  NotificationCategory,
  NotificationCategoryListParams,
  UpdateNotificationCategoryRequest,
} from '../types/notificationCategory.types';

// NotificationCategoriesService.findAll() nests { categories, page, limit, total, total_pages } inside `data`.
interface NotificationCategoriesListPayload {
  categories: NotificationCategory[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const notificationCategoriesService = {
  list: async (params: NotificationCategoryListParams = {}): Promise<PaginatedResult<NotificationCategory>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: NotificationCategoriesListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminNotificationCategories, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.categories,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  create: async (payload: CreateNotificationCategoryRequest): Promise<NotificationCategory> => {
    const response = await apiClient.post<ApiEnvelope<{ data: NotificationCategory; message: string }>>(
      API_ENDPOINTS.adminNotificationCategories,
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  update: async (id: number, payload: UpdateNotificationCategoryRequest): Promise<NotificationCategory> => {
    const response = await apiClient.patch<ApiEnvelope<{ data: NotificationCategory; message: string }>>(
      buildUrl(API_ENDPOINTS.adminNotificationCategoryById, { id }),
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  // Throws a 409 ConflictException if notifications still reference this
  // category — surfaces automatically as a toast via the interceptor.
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminNotificationCategoryById, { id }));
  },
};

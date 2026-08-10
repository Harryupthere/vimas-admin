// Matches Backend/src/shared/entities/notification-category.entity.ts.
// Paginated (page/limit/search) — unlike the flat "config table" pattern
// used by e.g. Order Status.

export interface NotificationCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  status: number;
  userPreference: boolean;
  createdAt: string;
}

export interface NotificationCategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateNotificationCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  status?: number;
  userPreference?: boolean;
}

export type UpdateNotificationCategoryRequest = Partial<CreateNotificationCategoryRequest>;

// Matches Backend/src/shared/entities/notification.entity.ts. Paginated,
// admin list is pre-filtered server-side to `is_admin_hidden = 0`.
// Broadcasts fan out to a real row per active user at send time — there's
// no separate "broadcast" record, so the list is always individual rows.

export interface NotificationUserRef {
  id: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  unique_user_id?: string;
}

export interface NotificationCategoryRef {
  id: number;
  name: string;
  icon?: string;
}

export interface NotificationTypeRef {
  id: number;
  name: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Notification {
  id: number;
  userId: number;
  user?: NotificationUserRef;
  notificationCategoryId: number;
  category?: NotificationCategoryRef;
  notificationTypeId: number;
  type?: NotificationTypeRef;
  heading: string;
  subheading: string | null;
  route: string | null;
  data: Record<string, unknown> | null;
  isRead: number;
  isUserHidden: number;
  isAdminHidden: number;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  userId?: number;
  categoryId?: number;
  typeId?: number;
  isRead?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

// The service enforces exactly one of userId / broadcast is set.
export interface CreateNotificationRequest {
  userId?: number;
  broadcast?: boolean;
  notificationCategoryId: number;
  notificationTypeId: number;
  heading: string;
  subheading?: string;
  route?: string;
  data?: Record<string, unknown>;
}

// Admin edit — only display content is mutable after send; target
// user/category/type are fixed at creation time.
export interface UpdateNotificationRequest {
  heading?: string;
  subheading?: string;
  route?: string;
  data?: Record<string, unknown>;
}

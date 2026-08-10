// Matches Backend/src/shared/entities/notification-type.entity.ts. Paginated.

export interface NotificationType {
  id: number;
  name: string;
  description: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  status: number;
  createdAt: string;
}

export interface NotificationTypeListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateNotificationTypeRequest {
  name: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  status?: number;
}

export type UpdateNotificationTypeRequest = Partial<CreateNotificationTypeRequest>;

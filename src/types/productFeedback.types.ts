// Matches Backend/src/shared/entities/product-feedback.entity.ts

export type ProductFeedbackStatus = 'active' | 'hidden' | 'deleted';

export interface ProductFeedbackUserRef {
  id: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface ProductFeedbackProductRef {
  id: number;
  name: string;
}

export interface ProductFeedback {
  id: number;
  productId: number;
  product?: ProductFeedbackProductRef;
  userId: number;
  user?: ProductFeedbackUserRef;
  parentFeedbackId: number | null;
  rating: number | null;
  comment: string;
  likeCount: number;
  replyCount: number;
  status: ProductFeedbackStatus;
  createdAt: string;
}

export interface ProductFeedbackListParams {
  page?: number;
  limit?: number;
  productId?: number;
  status?: ProductFeedbackStatus;
  [key: string]: string | number | boolean | undefined;
}

export interface SetFeedbackStatusRequest {
  status: ProductFeedbackStatus;
}

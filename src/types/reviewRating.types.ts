// Matches Backend/src/shared/entities/review-rating.entity.ts

export interface ReviewRatingUserRef {
  id: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface ReviewRatingProductRef {
  id: number;
  name: string;
}

export interface ReviewRating {
  id: number;
  userId: number;
  user?: ReviewRatingUserRef;
  productId: number;
  product?: ReviewRatingProductRef;
  orderId: number;
  rate: number;
  review: string | null;
  showStatus: number;
  createdAt: string;
}

export interface ReviewRatingListParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface SetVisibilityRequest {
  showStatus: number;
}

// Matches Backend/src/shared/entities/reward-mall-product.entity.ts +
// reward-mall-product-media.entity.ts. GET /admin/reward-mall-products is
// paginated (page/limit/categoryId/status). Media arrives embedded in the
// product's `media` relation — there's no admin GET-by-product endpoint for
// it, same gap as the regular Product's `productMedia`.

export interface RewardMallCategoryRef {
  id: number;
  name: string;
}

export interface RewardMallProductMedia {
  id: number;
  rewardMallProductId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  sortOrder: number;
}

export interface RewardMallProduct {
  id: number;
  categoryId: number;
  category?: RewardMallCategoryRef;
  name: string;
  subTitle?: string;
  description?: string;
  information?: string;
  notes?: string;
  keyPoints?: string[];
  details?: Record<string, unknown>[];
  searchKeywords?: string[];
  pointPrice: number;
  minimumQuantity: number;
  maximumQuantity: number;
  stockShow?: number;
  stock: number;
  isOutOfStock?: number;
  labelShow?: number;
  labelText?: string;
  labelColor?: string;
  viewCount?: number;
  likeCount?: number;
  sortOrder: number;
  status: number;
  media?: RewardMallProductMedia[];
  createdAt?: string;
}

export interface RewardMallProductListParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  status?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateRewardMallProductRequest {
  categoryId: number;
  name: string;
  subTitle?: string;
  description?: string;
  information?: string;
  notes?: string;
  keyPoints?: string[];
  details?: Record<string, unknown>[];
  searchKeywords?: string[];
  pointPrice: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
  stockShow?: boolean;
  stock?: number;
  isOutOfStock?: boolean;
  labelShow?: boolean;
  labelText?: string;
  labelColor?: string;
  sortOrder?: number;
  status?: number;
}

export type UpdateRewardMallProductRequest = Partial<CreateRewardMallProductRequest>;

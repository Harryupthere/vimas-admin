// Matches Vimas-Backend-V1/src/products/dto/create-product.dto.ts +
// Vimas-Backend-V1/src/shared/entities/products.entity.ts. GET /admin/products
// only accepts page/limit (Vimas-Backend-V1/src/products/admin/product.controller.ts)
// — no search/filter params exist yet.

import type { ProductPaymentOption } from './productPaymentOption.types';

export interface CategoryRef {
  id: number;
  name: string;
}

export interface BrandRef {
  id: number;
  name: string;
}

// Matches Backend/src/shared/entities/product-media.entity.ts. There's no
// GET-by-product endpoint on the admin controller — media only ever arrives
// embedded in a Product's `productMedia` relation (findOne/findAll include it).
export interface ProductMedia {
  id: number;
  product_id: number;
  media_url: string;
  media_type: 'image' | 'video';
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  subTitle?: string;
  description?: string;
  information?: string;
  notes?: string;
  keyPoints?: string[];
  details?: Record<string, unknown>[];
  searchKeywords?: string[];
  sellingPrice: number;
  discountAvailable?: number;
  discountAmount?: number;
  discountPercentage?: number;
  totalPoints?: number;
  showTotalPoints?: number;
  showPointsSharing?: number;
  stockShow?: number;
  stock: number;
  isOutOfStock?: number;
  labelShow?: number;
  labelText?: string;
  labelColor?: string;
  categoryId?: number;
  brandId?: number;
  viewCount?: number;
  likeCount?: number;
  status?: number;
  // Gates the reseller product listing (GET /products?type=reseller).
  bulkAvailable?: number;
  // Gates the consumer product listing (GET /products?type=consumer).
  consumerAvailable?: number;
  // Gates the partner product listing (GET /products?type=partner).
  partnerAvailable?: number;
  consumerMinimumQuantity?: number;
  consumerMaximumQuantity?: number;
  resellerMinimumQuantity?: number;
  resellerMaximumQuantity?: number;
  partnerMinimumQuantity?: number;
  partnerMaximumQuantity?: number;
  category?: CategoryRef;
  brand?: BrandRef;
  productMedia?: ProductMedia[];
  // Populated on findOne/findAll via the `paymentOptions.paymentOption`
  // relation — see productPaymentOption.types.ts for why there's no
  // dedicated list/remove endpoint for these mappings.
  paymentOptions?: ProductPaymentOption[];
  created_at?: string;
  updatedAt?: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateProductRequest {
  name: string;
  subTitle?: string;
  description?: string;
  information?: string;
  notes?: string;
  keyPoints?: string[];
  details?: Record<string, unknown>[];
  searchKeywords?: string[];
  sellingPrice: number;
  discountAvailable?: boolean;
  discountAmount?: number;
  discountPercentage?: number;
  totalPoints?: number;
  showTotalPoints?: boolean;
  showPointsSharing?: boolean;
  stockShow?: boolean;
  stock: number;
  isOutOfStock?: number;
  labelShow?: boolean;
  labelText?: string;
  labelColor?: string;
  categoryId: number;
  brandId?: number;
  status?: string;
  // Gates the reseller product listing (GET /products?type=reseller).
  bulkAvailable?: boolean;
  // Gates the consumer product listing (GET /products?type=consumer).
  consumerAvailable?: boolean;
  // Gates the partner product listing (GET /products?type=partner).
  partnerAvailable?: boolean;
  consumerMinimumQuantity?: number;
  consumerMaximumQuantity?: number;
  resellerMinimumQuantity?: number;
  resellerMaximumQuantity?: number;
  partnerMinimumQuantity?: number;
  partnerMaximumQuantity?: number;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

// The DTO's `status` field has no type decorator (accepts anything), but the
// entity column is numeric (buildProductEntity() always sets `status: 0`) —
// this is what the original Postman examples actually send.
export interface UpdateProductStatusRequest {
  status: number;
}

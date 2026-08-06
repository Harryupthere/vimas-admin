// Matches Backend/src/products/dto/create-product.dto.ts +
// Backend/src/shared/entities/products.entity.ts. GET /admin/products only
// accepts page/limit (Backend/src/products/admin/product.controller.ts) —
// no search/filter params exist yet.

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
  status?: number;
  category?: CategoryRef;
  brand?: BrandRef;
  productMedia?: ProductMedia[];
  created_at?: string;
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
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

// The DTO's `status` field has no type decorator (accepts anything), but the
// entity column is numeric (buildProductEntity() always sets `status: 0`) —
// this is what the original Postman examples actually send.
export interface UpdateProductStatusRequest {
  status: number;
}

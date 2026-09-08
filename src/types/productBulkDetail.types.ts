// Matches Backend/src/shared/entities/product-bulk-detail.entity.ts. No
// pagination — findAll() returns the full filtered list (config-table-style
// pattern, like point-distribution/order-status), optionally scoped to a
// product and/or status. (productId, packageQuantity) is unique per row —
// duplicate creates/updates surface as a 409 via the response interceptor.

export interface ProductBulkDetail {
  id: number;
  productId: number;
  product?: { id: number; name: string };
  packageQuantity: number;
  unitPrice: number;
  discountPercentage: number;
  freeQuantity: number;
  fees: number;
  shippingCharges: number;
  totalPrice: number;
  totalPoints: number;
  showTotalPoints: number;
  showPointsSharing: number;
  sortOrder: number;
  status: number;
  createdAt: string;
}

export interface ProductBulkDetailListParams {
  productId?: number;
  status?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateProductBulkDetailRequest {
  productId: number;
  packageQuantity: number;
  unitPrice: number;
  discountPercentage?: number;
  freeQuantity?: number;
  fees?: number;
  shippingCharges?: number;
  totalPrice?: number;
  totalPoints?: number;
  showTotalPoints?: boolean;
  showPointsSharing?: boolean;
  sortOrder?: number;
  status?: number;
}

export type UpdateProductBulkDetailRequest = Partial<CreateProductBulkDetailRequest>;

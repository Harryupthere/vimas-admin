// Matches Backend/src/shared/entities/product-coupon.entity.ts +
// product-coupons/dto/*. No pagination — findAll() returns the full
// filtered list, scoped by productId/productType/isActive/search.

import type { ProductType } from './productType.types';

export type CouponDiscountType = 'PERCENTAGE' | 'AMOUNT';

export const COUPON_DISCOUNT_TYPES: CouponDiscountType[] = ['PERCENTAGE', 'AMOUNT'];

export interface ProductCoupon {
  id: number;
  productId: number;
  product?: { id: number; name: string };
  code: string;
  name: string;
  description: string | null;
  productType: ProductType;
  discountType: CouponDiscountType;
  percentage: number;
  amount: number;
  minimumQuantity: number | null;
  maximumDiscountAmount: number | null;
  usageLimit: number | null;
  startAt: string | null;
  endAt: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCouponListParams {
  productId?: number;
  productType?: ProductType;
  isActive?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateProductCouponRequest {
  productId: number;
  code: string;
  name: string;
  description?: string;
  productType?: ProductType;
  discountType?: CouponDiscountType;
  percentage?: number;
  amount?: number;
  minimumQuantity?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  startAt?: string;
  endAt?: string;
  isActive?: number;
}

export type UpdateProductCouponRequest = Partial<CreateProductCouponRequest>;

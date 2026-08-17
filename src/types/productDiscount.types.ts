// Matches Backend/src/shared/entities/product-discount.entity.ts +
// product-discounts/dto/*. No pagination — findAll() returns the full
// filtered list, scoped by productId/productType/isActive/search. Unlike
// product_coupons, these are applied automatically at checkout (no code).

import type { ProductType } from './productType.types';

export type DiscountType = 'PERCENTAGE' | 'AMOUNT';

export const DISCOUNT_TYPES: DiscountType[] = ['PERCENTAGE', 'AMOUNT'];

export interface ProductDiscount {
  id: number;
  productId: number;
  product?: { id: number; name: string };
  name: string;
  description: string | null;
  productType: ProductType;
  discountType: DiscountType;
  percentage: number;
  amount: number;
  minimumQuantity: number | null;
  maximumDiscountAmount: number | null;
  startAt: string | null;
  endAt: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDiscountListParams {
  productId?: number;
  productType?: ProductType;
  isActive?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateProductDiscountRequest {
  productId: number;
  name: string;
  description?: string;
  productType?: ProductType;
  discountType?: DiscountType;
  percentage?: number;
  amount?: number;
  minimumQuantity?: number;
  maximumDiscountAmount?: number;
  startAt?: string;
  endAt?: string;
  isActive?: number;
}

export type UpdateProductDiscountRequest = Partial<CreateProductDiscountRequest>;

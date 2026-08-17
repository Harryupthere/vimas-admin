// Matches Backend/src/shared/entities/product-add-on.entity.ts +
// product-add-ons/dto/*. No pagination — findAll() returns the full
// filtered list, scoped by productId/productType/isActive/search.

import type { ProductType } from './productType.types';

export type AddOnCalculationType = 'PERCENTAGE' | 'AMOUNT';

export const ADD_ON_CALCULATION_TYPES: AddOnCalculationType[] = ['PERCENTAGE', 'AMOUNT'];

export interface ProductAddOn {
  id: number;
  productId: number;
  product?: { id: number; name: string };
  name: string;
  description: string | null;
  symbol: string | null;
  productType: ProductType;
  calculationType: AddOnCalculationType;
  percentage: number;
  amount: number;
  // 0 = applied once, 1 = applied for each quantity
  costPerUnit: number;
  applicableMinimumQuantity: number | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAddOnListParams {
  productId?: number;
  productType?: ProductType;
  isActive?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateProductAddOnRequest {
  productId: number;
  name: string;
  description?: string;
  symbol?: string;
  productType?: ProductType;
  calculationType?: AddOnCalculationType;
  percentage?: number;
  amount?: number;
  costPerUnit?: boolean;
  applicableMinimumQuantity?: number;
  isActive?: number;
}

export type UpdateProductAddOnRequest = Partial<CreateProductAddOnRequest>;

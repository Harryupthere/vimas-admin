// Matches Backend/src/shared/entities/product-extra-charge.entity.ts +
// product-extra-charges/dto/*. No pagination — findAll() returns the full
// filtered list (same config-table-style pattern as product-bulk-details),
// scoped by productId/productType/isActive/search.

import type { ProductType } from './productType.types';

export type ChargeCalculationBasis = 'QUANTITY' | 'PRODUCT';
export type ChargeCalculationType = 'PERCENTAGE' | 'AMOUNT';

export const CHARGE_CALCULATION_BASES: ChargeCalculationBasis[] = ['QUANTITY', 'PRODUCT'];
export const CHARGE_CALCULATION_TYPES: ChargeCalculationType[] = ['PERCENTAGE', 'AMOUNT'];

export interface ProductExtraCharge {
  id: number;
  productId: number;
  product?: { id: number; name: string };
  name: string;
  description: string | null;
  symbol: string | null;
  productType: ProductType;
  calculationBasis: ChargeCalculationBasis;
  calculationType: ChargeCalculationType;
  amount: number;
  percentage: number;
  fixedAmount: number;
  fixedAmountBasis: ChargeCalculationBasis | null;
  waiveAtQuantity: number | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductExtraChargeListParams {
  productId?: number;
  productType?: ProductType;
  isActive?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateProductExtraChargeRequest {
  productId: number;
  name: string;
  description?: string;
  symbol?: string;
  productType?: ProductType;
  calculationBasis?: ChargeCalculationBasis;
  calculationType?: ChargeCalculationType;
  amount?: number;
  percentage?: number;
  fixedAmount?: number;
  fixedAmountBasis?: ChargeCalculationBasis;
  waiveAtQuantity?: number;
  isActive?: number;
}

export type UpdateProductExtraChargeRequest = Partial<CreateProductExtraChargeRequest>;

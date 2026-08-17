import { z } from 'zod';
import { CHARGE_CALCULATION_BASES, CHARGE_CALCULATION_TYPES } from '../../types/productExtraCharge.types';
import { PRODUCT_TYPES } from '../../types/productType.types';

export const productExtraChargeSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  symbol: z.string().optional(),
  productType: z.enum(PRODUCT_TYPES as [string, ...string[]], { errorMap: () => ({ message: 'Product type is required' }) }),
  calculationBasis: z.enum(CHARGE_CALCULATION_BASES as [string, ...string[]]).optional(),
  calculationType: z.enum(CHARGE_CALCULATION_TYPES as [string, ...string[]]).optional(),
  amount: z.coerce.number().min(0).optional(),
  percentage: z.coerce.number().min(0).optional(),
  fixedAmount: z.coerce.number().min(0).optional(),
  fixedAmountBasis: z.union([z.enum(CHARGE_CALCULATION_BASES as [string, ...string[]]), z.literal('')]).optional(),
  waiveAtQuantity: z.coerce.number().int().min(0).optional(),
  isActive: z.coerce.number().optional(),
});

export type ProductExtraChargeFormValues = z.infer<typeof productExtraChargeSchema>;

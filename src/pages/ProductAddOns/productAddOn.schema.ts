import { z } from 'zod';
import { ADD_ON_CALCULATION_TYPES } from '../../types/productAddOn.types';
import { PRODUCT_TYPES } from '../../types/productType.types';

export const productAddOnSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  symbol: z.string().optional(),
  productType: z.enum(PRODUCT_TYPES as [string, ...string[]], { errorMap: () => ({ message: 'Product type is required' }) }),
  calculationType: z.enum(ADD_ON_CALCULATION_TYPES as [string, ...string[]]).optional(),
  percentage: z.coerce.number().min(0).optional(),
  amount: z.coerce.number().min(0).optional(),
  costPerUnit: z.boolean().optional(),
  applicableMinimumQuantity: z.coerce.number().int().min(0).optional(),
  isActive: z.coerce.number().optional(),
});

export type ProductAddOnFormValues = z.infer<typeof productAddOnSchema>;

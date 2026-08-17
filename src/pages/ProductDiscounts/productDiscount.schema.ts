import { z } from 'zod';
import { DISCOUNT_TYPES } from '../../types/productDiscount.types';
import { PRODUCT_TYPES } from '../../types/productType.types';

export const productDiscountSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  productType: z.enum(PRODUCT_TYPES as [string, ...string[]], { errorMap: () => ({ message: 'Product type is required' }) }),
  discountType: z.enum(DISCOUNT_TYPES as [string, ...string[]]).optional(),
  percentage: z.coerce.number().min(0).optional(),
  amount: z.coerce.number().min(0).optional(),
  minimumQuantity: z.coerce.number().int().min(0).optional(),
  maximumDiscountAmount: z.coerce.number().min(0).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  isActive: z.coerce.number().optional(),
});

export type ProductDiscountFormValues = z.infer<typeof productDiscountSchema>;

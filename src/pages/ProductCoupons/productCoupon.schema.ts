import { z } from 'zod';
import { COUPON_DISCOUNT_TYPES } from '../../types/productCoupon.types';
import { PRODUCT_TYPES } from '../../types/productType.types';

export const productCouponSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  productType: z.enum(PRODUCT_TYPES as [string, ...string[]], { errorMap: () => ({ message: 'Product type is required' }) }),
  discountType: z.enum(COUPON_DISCOUNT_TYPES as [string, ...string[]]).optional(),
  percentage: z.coerce.number().min(0).optional(),
  amount: z.coerce.number().min(0).optional(),
  minimumQuantity: z.coerce.number().int().min(0).optional(),
  maximumDiscountAmount: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().int().min(0).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  isActive: z.coerce.number().optional(),
});

export type ProductCouponFormValues = z.infer<typeof productCouponSchema>;

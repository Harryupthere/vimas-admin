import { z } from 'zod';

export const productBulkDetailSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  packageQuantity: z.coerce.number({ invalid_type_error: 'Package quantity is required' }).int().min(0),
  unitPrice: z.coerce.number({ invalid_type_error: 'Unit price is required' }).min(0),
  discountPercentage: z.coerce.number().min(0).optional(),
  freeQuantity: z.coerce.number().int().min(0).optional(),
  fees: z.coerce.number().min(0).optional(),
  totalPrice: z.coerce.number().min(0).optional(),
  totalPoints: z.coerce.number().min(0).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  status: z.coerce.number().optional(),
});

export type ProductBulkDetailFormValues = z.infer<typeof productBulkDetailSchema>;

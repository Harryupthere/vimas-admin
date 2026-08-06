import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subTitle: z.string().optional(),
  description: z.string().optional(),
  sellingPrice: z.coerce.number({ invalid_type_error: 'Selling price is required' }).positive('Must be greater than 0'),
  stock: z.coerce.number({ invalid_type_error: 'Stock is required' }).min(0, 'Stock cannot be negative'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  totalPoints: z.coerce.number().optional(),
  showTotalPoints: z.boolean().optional(),
  showPointsSharing: z.boolean().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

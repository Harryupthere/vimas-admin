import { z } from 'zod';

export const productSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    subTitle: z.string().optional(),
    description: z.string().optional(),
    information: z.string().optional(),
    notes: z.string().optional(),
    keyPoints: z.string().optional(), // one per line, split on submit
    searchKeywords: z.string().optional(), // one per line, split on submit
    detailsJson: z.string().optional(), // raw JSON array, parsed + validated on submit

    sellingPrice: z.coerce.number({ invalid_type_error: 'Selling price is required' }).positive('Must be greater than 0'),
    discountAvailable: z.boolean().optional(),
    discountAmount: z.coerce.number().min(0).optional(),
    discountPercentage: z.coerce.number().min(0).max(100).optional(),

    stock: z.coerce.number({ invalid_type_error: 'Stock is required' }).min(0, 'Stock cannot be negative'),
    stockShow: z.boolean().optional(),
    isOutOfStock: z.boolean().optional(),

    categoryId: z.string().min(1, 'Category is required'),
    brandId: z.string().optional(),

    totalPoints: z.coerce.number().optional(),
    showTotalPoints: z.boolean().optional(),
    showPointsSharing: z.boolean().optional(),

    labelShow: z.boolean().optional(),
    labelText: z.string().optional(),
    labelColor: z.string().optional(),

    bulkAvailable: z.boolean().optional(),
    consumerAvailable: z.boolean().optional(),
    partnerAvailable: z.boolean().optional(),
    partnerMinimumQuantity: z.coerce.number().min(1, 'Must be at least 1').optional(),
    partnerMaximumQuantity: z.coerce.number().min(1, 'Must be at least 1').optional(),
  })
  .refine(
    (values) => {
      if (!values.detailsJson || !values.detailsJson.trim()) return true;
      try {
        const parsed = JSON.parse(values.detailsJson);
        return Array.isArray(parsed);
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid JSON array, e.g. [{"label":"Weight","value":"500g"}]', path: ['detailsJson'] },
  )
  .refine(
    (values) =>
      values.partnerMinimumQuantity === undefined ||
      values.partnerMaximumQuantity === undefined ||
      values.partnerMinimumQuantity <= values.partnerMaximumQuantity,
    { message: 'Must be greater than or equal to minimum quantity', path: ['partnerMaximumQuantity'] },
  );

export type ProductFormValues = z.infer<typeof productSchema>;

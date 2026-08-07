import { z } from 'zod';

export const rewardMallProductSchema = z
  .object({
    categoryId: z.string().min(1, 'Category is required'),
    name: z.string().min(1, 'Name is required'),
    subTitle: z.string().optional(),
    description: z.string().optional(),
    information: z.string().optional(),
    notes: z.string().optional(),
    keyPoints: z.string().optional(), // one per line, split on submit
    searchKeywords: z.string().optional(), // one per line, split on submit
    detailsJson: z.string().optional(), // raw JSON array, parsed + validated on submit

    pointPrice: z.coerce.number({ invalid_type_error: 'Point price is required' }).min(0),
    minimumQuantity: z.coerce.number().int().min(1).optional(),
    maximumQuantity: z.coerce.number().int().min(1).optional(),

    stock: z.coerce.number().min(0).optional(),
    stockShow: z.boolean().optional(),
    isOutOfStock: z.boolean().optional(),

    labelShow: z.boolean().optional(),
    labelText: z.string().optional(),
    labelColor: z.string().optional(),

    sortOrder: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (values) => {
      if (!values.detailsJson || !values.detailsJson.trim()) return true;
      try {
        return Array.isArray(JSON.parse(values.detailsJson));
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid JSON array, e.g. [{"label":"Weight","value":"500g"}]', path: ['detailsJson'] },
  );

export type RewardMallProductFormValues = z.infer<typeof rewardMallProductSchema>;

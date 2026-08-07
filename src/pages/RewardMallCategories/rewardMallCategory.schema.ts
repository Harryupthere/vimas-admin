import { z } from 'zod';

export const rewardMallCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  status: z.coerce.number().optional(),
});

export type RewardMallCategoryFormValues = z.infer<typeof rewardMallCategorySchema>;

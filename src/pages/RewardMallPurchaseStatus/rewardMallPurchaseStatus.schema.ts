import { z } from 'zod';

export const rewardMallPurchaseStatusSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  colour: z.string().optional(),
  icon: z.string().optional(),
  symbol: z.string().optional(),
  status: z.coerce.number().optional(),
});

export type RewardMallPurchaseStatusFormValues = z.infer<typeof rewardMallPurchaseStatusSchema>;

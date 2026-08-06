import { z } from 'zod';

export const orderStatusSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export type OrderStatusFormValues = z.infer<typeof orderStatusSchema>;

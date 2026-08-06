import { z } from 'zod';

export const paymentStatusSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  colour: z.string().optional(),
});

export type PaymentStatusFormValues = z.infer<typeof paymentStatusSchema>;

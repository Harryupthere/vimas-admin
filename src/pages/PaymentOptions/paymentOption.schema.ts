import { z } from 'zod';

export const paymentOptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  charges: z.coerce.number().min(0, 'Charges cannot be negative').optional(),
  note: z.string().optional(), // one note per line, split on submit
  status: z.coerce.number().optional(),
});

export type PaymentOptionFormValues = z.infer<typeof paymentOptionSchema>;

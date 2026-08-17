import { z } from 'zod';

export const adjustWalletSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']),
  amount: z.coerce.number({ invalid_type_error: 'Amount is required' }).positive('Must be greater than 0'),
  description: z.string().optional(),
});

export type AdjustWalletFormValues = z.infer<typeof adjustWalletSchema>;

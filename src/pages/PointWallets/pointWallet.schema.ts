import { z } from 'zod';

export const createUserBalanceSchema = z.object({
  userId: z.coerce.number({ invalid_type_error: 'User ID is required' }).int().positive(),
  totalCredit: z.coerce.number().optional(),
  totalDebit: z.coerce.number().optional(),
  currentBalance: z.coerce.number().optional(),
});
export type CreateUserBalanceFormValues = z.infer<typeof createUserBalanceSchema>;

export const createAdminBalanceSchema = z.object({
  adminId: z.coerce.number({ invalid_type_error: 'Admin ID is required' }).int().positive(),
  totalCredit: z.coerce.number().optional(),
  totalDebit: z.coerce.number().optional(),
  currentBalance: z.coerce.number().optional(),
});
export type CreateAdminBalanceFormValues = z.infer<typeof createAdminBalanceSchema>;

export const editBalanceSchema = z.object({
  totalCredit: z.coerce.number().optional(),
  totalDebit: z.coerce.number().optional(),
  currentBalance: z.coerce.number().optional(),
});
export type EditBalanceFormValues = z.infer<typeof editBalanceSchema>;

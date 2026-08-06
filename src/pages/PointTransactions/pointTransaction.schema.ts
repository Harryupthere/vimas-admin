import { z } from 'zod';
import { POINT_TRANSACTION_REASONS, POINT_TRANSACTION_TYPES, POINT_WALLET_TYPES } from '../../types/point.types';

export const createPointTransactionSchema = z.object({
  walletType: z.enum(POINT_WALLET_TYPES as [string, ...string[]]),
  walletId: z.coerce.number({ invalid_type_error: 'Wallet ID is required' }).int().positive(),
  transactionType: z.enum(POINT_TRANSACTION_TYPES as [string, ...string[]]),
  transactionReason: z.enum(POINT_TRANSACTION_REASONS as [string, ...string[]]),
  sourceUserId: z.coerce.number().int().optional(),
  sourceAdminId: z.coerce.number().int().optional(),
  productId: z.coerce.number().int().optional(),
  orderId: z.coerce.number().int().optional(),
  pointDistributionId: z.coerce.number().int().optional(),
  poolId: z.coerce.number().int().optional(),
  amount: z.coerce.number({ invalid_type_error: 'Amount is required' }).positive('Must be greater than 0'),
  remarks: z.string().optional(),
});

export type CreatePointTransactionFormValues = z.infer<typeof createPointTransactionSchema>;

export const editPointTransactionSchema = z.object({
  amount: z.coerce.number({ invalid_type_error: 'Amount is required' }).positive('Must be greater than 0'),
  transactionReason: z.enum(POINT_TRANSACTION_REASONS as [string, ...string[]]),
  remarks: z.string().optional(),
});

export type EditPointTransactionFormValues = z.infer<typeof editPointTransactionSchema>;

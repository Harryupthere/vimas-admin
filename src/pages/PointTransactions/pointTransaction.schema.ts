import { z } from 'zod';
import { POINT_TRANSACTION_REASONS, POINT_TRANSACTION_TYPES, POINT_WALLET_TYPES } from '../../types/point.types';

export const createPointTransactionSchema = z.object({
  walletType: z.enum(POINT_WALLET_TYPES as [string, ...string[]]),
  walletId: z.string().min(1, 'Wallet is required'),
  transactionType: z.enum(POINT_TRANSACTION_TYPES as [string, ...string[]]),
  transactionReason: z.enum(POINT_TRANSACTION_REASONS as [string, ...string[]]),
  sourceUserId: z.string().optional(),
  sourceAdminId: z.string().optional(),
  productId: z.string().optional(),
  orderId: z.string().optional(),
  pointDistributionId: z.string().optional(),
  poolId: z.string().optional(),
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

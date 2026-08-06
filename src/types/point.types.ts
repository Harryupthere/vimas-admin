// Matches Backend/src/shared/entities/point-transaction.entity.ts

export type PointWalletType = 'USER' | 'ADMIN' | 'POOL';
export type PointTransactionType = 'CREDIT' | 'DEBIT';
export type PointTransactionReason =
  | 'BUY_PRODUCT'
  | 'SELL_PRODUCT'
  | 'PURCHASE_REWARD'
  | 'REFERRAL_LEVEL_1'
  | 'REFERRAL_LEVEL_2'
  | 'POOL_CONTRIBUTION'
  | 'POOL_DISTRIBUTION'
  | 'PRODUCT_PURCHASE'
  | 'ADMIN_ADJUSTMENT'
  | 'BONUS'
  | 'REFUND'
  | 'EXPIRE'
  | 'OTHER';

export interface PointTransaction {
  id: number;
  walletType: PointWalletType;
  walletId: number;
  transactionType: PointTransactionType;
  transactionReason: PointTransactionReason;
  sourceUserId: number | null;
  sourceAdminId: number | null;
  receiverUserId: number | null;
  receiverAdminId: number | null;
  productId: number | null;
  orderId: number | null;
  pointDistributionId: number | null;
  poolId: number | null;
  amount: number;
  remarks: string | null;
  createdAt: string;
}

export interface PointTransactionListParams {
  page?: number;
  limit?: number;
  walletType?: PointWalletType;
  walletId?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface CreatePointTransactionRequest {
  walletType: PointWalletType;
  walletId: number;
  transactionType: PointTransactionType;
  transactionReason: PointTransactionReason;
  sourceUserId?: number;
  sourceAdminId?: number;
  productId?: number;
  orderId?: number;
  pointDistributionId?: number;
  poolId?: number;
  amount: number;
  remarks?: string;
}

// Backend/src/point-transaction/dto/update-point-transaction.dto.ts —
// deliberately narrow, wallet identity fields can never be reassigned.
export interface UpdatePointTransactionRequest {
  amount?: number;
  transactionReason?: PointTransactionReason;
  remarks?: string;
}

export const POINT_WALLET_TYPES: PointWalletType[] = ['USER', 'ADMIN', 'POOL'];
export const POINT_TRANSACTION_TYPES: PointTransactionType[] = ['CREDIT', 'DEBIT'];
export const POINT_TRANSACTION_REASONS: PointTransactionReason[] = [
  'BUY_PRODUCT',
  'SELL_PRODUCT',
  'PURCHASE_REWARD',
  'REFERRAL_LEVEL_1',
  'REFERRAL_LEVEL_2',
  'POOL_CONTRIBUTION',
  'POOL_DISTRIBUTION',
  'PRODUCT_PURCHASE',
  'ADMIN_ADJUSTMENT',
  'BONUS',
  'REFUND',
  'EXPIRE',
  'OTHER',
];

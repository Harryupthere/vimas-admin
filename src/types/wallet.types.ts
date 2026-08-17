// Matches Backend/src/vimas-e-wallet/* (VimasEWalletService +
// wallet-admin.controller.ts) and shared/entities/vimas-e-wallet-transaction.entity.ts.
// Store credit on users.vimas_e_wallet_balance, usable toward normal
// checkout only (never reward_mall_products). Every balance mutation writes
// a matching VimasEWalletTransaction ledger row in the same DB transaction.

export type WalletTransactionType = 'CREDIT' | 'DEBIT' | 'CHECKOUT' | 'REFUND';
export type WalletTransactionCreatedBy = 'USER' | 'ADMIN' | 'SYSTEM';

export const WALLET_TRANSACTION_TYPES: WalletTransactionType[] = ['CREDIT', 'DEBIT', 'CHECKOUT', 'REFUND'];

// One row of the admin wallet overview (GET /admin/wallet) — a thin slice
// of the user entity, not a dedicated wallet table.
export interface WalletOverview {
  id: number;
  unique_user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  vimasEWalletBalance: number;
  vimasEWalletStatus: number;
}

// GET /admin/wallet/:userId
export interface WalletBalance {
  userId: number;
  balance: number;
  status: number;
}

export interface WalletListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface WalletTransaction {
  id: number;
  userId: number;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdBy: WalletTransactionCreatedBy;
  description: string | null;
  referenceType: string | null;
  referenceId: number | null;
  createdAt: string;
}

export interface WalletTransactionListParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface UpdateWalletStatusRequest {
  isActive: boolean;
}

// Backend/src/vimas-e-wallet/dto/credit-wallet.dto.ts + debit-wallet.dto.ts
// — identical shape for both endpoints.
export interface AdjustWalletRequest {
  amount: number;
  description?: string;
}

import { apiClient, unwrapData, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult, ServiceResult } from '../types/api.types';
import type {
  AdjustWalletRequest,
  UpdateWalletStatusRequest,
  WalletBalance,
  WalletListParams,
  WalletOverview,
  WalletTransaction,
  WalletTransactionListParams,
} from '../types/wallet.types';

// VimasEWalletService.findAllWallets() nests { users, page, limit, total, total_pages } inside `data`.
interface WalletListPayload {
  users: WalletOverview[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// VimasEWalletService.findTransactions() nests { transactions, page, limit, total, total_pages } inside `data`.
interface WalletTransactionsPayload {
  transactions: WalletTransaction[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const walletService = {
  list: async (params: WalletListParams = {}): Promise<PaginatedResult<WalletOverview>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: WalletListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminWallet, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.users,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  getBalance: async (userId: number): Promise<WalletBalance> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<WalletBalance>>>(
      buildUrl(API_ENDPOINTS.adminWalletById, { userId }),
    );
    return unwrapData(response);
  },

  transactions: async (userId: number, params: WalletTransactionListParams = {}): Promise<PaginatedResult<WalletTransaction>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: WalletTransactionsPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminWalletTransactions, { userId, ...params }),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.transactions,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  setStatus: async (userId: number, payload: UpdateWalletStatusRequest): Promise<{ userId: number; status: number }> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<{ userId: number; status: number }>>>(
      buildUrl(API_ENDPOINTS.adminWalletStatus, { userId }),
      payload,
    );
    return unwrapData(response);
  },

  // Adds to the user's balance and writes a CREDIT ledger row — this is
  // "admin adds amount for user".
  credit: async (userId: number, payload: AdjustWalletRequest): Promise<WalletTransaction> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<WalletTransaction>>>(
      buildUrl(API_ENDPOINTS.adminWalletCredit, { userId }),
      payload,
    );
    return unwrapData(response);
  },

  // Removes from the user's balance and writes a DEBIT ledger row. Rejected
  // (400) server-side if it would take the balance negative.
  debit: async (userId: number, payload: AdjustWalletRequest): Promise<WalletTransaction> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<WalletTransaction>>>(
      buildUrl(API_ENDPOINTS.adminWalletDebit, { userId }),
      payload,
    );
    return unwrapData(response);
  },
};

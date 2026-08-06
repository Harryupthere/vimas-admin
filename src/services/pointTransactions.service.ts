import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreatePointTransactionRequest,
  PointTransaction,
  PointTransactionListParams,
  UpdatePointTransactionRequest,
} from '../types/point.types';

// PointTransactionService.findAll() nests { transactions, page, limit, total, total_pages } inside `data`.
interface PointTransactionsListPayload {
  transactions: PointTransaction[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const pointTransactionsService = {
  list: async (params: PointTransactionListParams = {}): Promise<PaginatedResult<PointTransaction>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: PointTransactionsListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminPointTransaction, params),
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

  getById: async (id: number): Promise<PointTransaction> => {
    const response = await apiClient.get<ApiEnvelope<{ data: PointTransaction; message: string }>>(
      buildUrl(API_ENDPOINTS.adminPointTransactionById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  create: async (payload: CreatePointTransactionRequest): Promise<PointTransaction> => {
    const response = await apiClient.post<ApiEnvelope<{ data: PointTransaction; message: string }>>(
      API_ENDPOINTS.adminPointTransaction,
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  // Wallet identity fields (walletType/walletId/sourceUserId/sourceAdminId/
  // transactionType) are intentionally not accepted here — see
  // UpdatePointTransactionRequest's docstring.
  update: async (id: number, payload: UpdatePointTransactionRequest): Promise<PointTransaction> => {
    const response = await apiClient.patch<ApiEnvelope<{ data: PointTransaction; message: string }>>(
      buildUrl(API_ENDPOINTS.adminPointTransactionById, { id }),
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminPointTransactionById, { id }));
  },
};

import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreatePointAdminBalanceRequest,
  CreatePointUserBalanceRequest,
  PointAdminBalance,
  PointBalanceListParams,
  PointUserBalance,
  UpdatePointBalanceRequest,
} from '../types/pointWallet.types';

interface BalanceListPayload<T> {
  balances: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

function normalizeBalanceList<T>(payload: BalanceListPayload<T>): PaginatedResult<T> {
  return {
    items: payload.balances,
    total: payload.total,
    page: payload.page,
    limit: payload.limit,
    totalPages: payload.total_pages,
  };
}

export const pointUserBalanceService = {
  list: async (params: PointBalanceListParams = {}): Promise<PaginatedResult<PointUserBalance>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: BalanceListPayload<PointUserBalance>; message: string }>>(
      buildUrl(API_ENDPOINTS.adminPointUserBalance, params),
    );
    return normalizeBalanceList(unwrapEnvelope(response).data);
  },

  create: async (payload: CreatePointUserBalanceRequest): Promise<PointUserBalance> => {
    const response = await apiClient.post<ApiEnvelope<{ data: PointUserBalance; message: string }>>(
      API_ENDPOINTS.adminPointUserBalance,
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  update: async (id: number, payload: UpdatePointBalanceRequest): Promise<PointUserBalance> => {
    const response = await apiClient.patch<ApiEnvelope<{ data: PointUserBalance; message: string }>>(
      buildUrl(API_ENDPOINTS.adminPointUserBalanceById, { id }),
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminPointUserBalanceById, { id }));
  },
};

export const pointAdminBalanceService = {
  list: async (params: PointBalanceListParams = {}): Promise<PaginatedResult<PointAdminBalance>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: BalanceListPayload<PointAdminBalance>; message: string }>>(
      buildUrl(API_ENDPOINTS.adminPointAdminBalance, params),
    );
    return normalizeBalanceList(unwrapEnvelope(response).data);
  },

  create: async (payload: CreatePointAdminBalanceRequest): Promise<PointAdminBalance> => {
    const response = await apiClient.post<ApiEnvelope<{ data: PointAdminBalance; message: string }>>(
      API_ENDPOINTS.adminPointAdminBalance,
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  update: async (id: number, payload: UpdatePointBalanceRequest): Promise<PointAdminBalance> => {
    const response = await apiClient.patch<ApiEnvelope<{ data: PointAdminBalance; message: string }>>(
      buildUrl(API_ENDPOINTS.adminPointAdminBalanceById, { id }),
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminPointAdminBalanceById, { id }));
  },
};

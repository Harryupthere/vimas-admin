import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreateUserTypeRequest,
  UpdateUserTypeRequest,
  UserType,
  UserTypeListParams,
} from '../types/userType.types';

// UserTypesService.findAll() (Backend/src/user_types/user_types.service.ts)
// flattens pagination as siblings of `data` instead of nesting it inside —
// unlike users/products/orders. Unwrap it explicitly to match.
interface UserTypesListEnvelope {
  data: UserType[];
  message: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const userTypesService = {
  list: async (params: UserTypeListParams = {}): Promise<PaginatedResult<UserType>> => {
    const response = await apiClient.get<ApiEnvelope<UserTypesListEnvelope>>(
      buildUrl(API_ENDPOINTS.adminUserTypes, params),
    );
    const inner = unwrapEnvelope(response);
    return {
      items: inner.data,
      total: inner.total,
      page: inner.page,
      limit: inner.limit,
      totalPages: inner.total_pages,
    };
  },

  getById: async (id: number): Promise<UserType> => {
    const response = await apiClient.get<ApiEnvelope<{ data: UserType; message: string }>>(
      buildUrl(API_ENDPOINTS.adminUserTypeById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  create: async (payload: CreateUserTypeRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.adminUserTypes, payload);
  },

  update: async (id: number, payload: UpdateUserTypeRequest): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminUserTypeById, { id }), payload);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminUserTypeById, { id }));
  },
};

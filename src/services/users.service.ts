import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type { UpdateUserRequest, User, UserListParams } from '../types/user.types';

// UsersService.findAll() (Backend/src/users/users.service.ts) nests
// pagination inside `data`: { data: { users, total, page, limit, total_pages }, message }
interface UsersListPayload {
  users: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const usersService = {
  list: async (params: UserListParams = {}): Promise<PaginatedResult<User>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: UsersListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminUsers, params),
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

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiEnvelope<{ data: User; message: string }>>(
      buildUrl(API_ENDPOINTS.adminUserById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  // UsersService.update() (Backend) returns only `{ message: 'User updated' }` —
  // no updated record — so there's nothing useful to return here.
  update: async (id: number, payload: UpdateUserRequest): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminUserById, { id }), payload);
  },
};

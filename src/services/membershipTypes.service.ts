import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreateMembershipTypeRequest,
  MembershipType,
  MembershipTypeListParams,
  UpdateMembershipTypeRequest,
} from '../types/membershipType.types';

// MembershipTypesService.findAll() flattens pagination as siblings of `data`
// (same pattern as user-types) — create()/update()/remove() return only
// `{ message }`, no data.
interface MembershipTypesListEnvelope {
  data: MembershipType[];
  message: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const membershipTypesService = {
  list: async (params: MembershipTypeListParams = {}): Promise<PaginatedResult<MembershipType>> => {
    const response = await apiClient.get<ApiEnvelope<MembershipTypesListEnvelope>>(
      buildUrl(API_ENDPOINTS.adminMembershipTypes, params),
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

  getById: async (id: number): Promise<MembershipType> => {
    const response = await apiClient.get<ApiEnvelope<{ data: MembershipType; message: string }>>(
      buildUrl(API_ENDPOINTS.adminMembershipTypeById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  create: async (payload: CreateMembershipTypeRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.adminMembershipTypes, payload);
  },

  update: async (id: number, payload: UpdateMembershipTypeRequest): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminMembershipTypeById, { id }), payload);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminMembershipTypeById, { id }));
  },
};

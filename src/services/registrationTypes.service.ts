import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreateRegistrationTypeRequest,
  RegistrationType,
  RegistrationTypeListParams,
  UpdateRegistrationTypeRequest,
} from '../types/registrationType.types';

// RegistrationTypesService.findAll() flattens pagination as siblings of `data`
// (same pattern as user-types/membership-types). Unlike those, create() and
// findOne() here return the raw entity directly — this service's create()
// bypasses the {data, message} convention entirely (`return this.repo.save(...)`)
// — so unwrapEnvelope() alone is the full payload for those two calls.
interface RegistrationTypesListEnvelope {
  data: RegistrationType[];
  message: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const registrationTypesService = {
  list: async (params: RegistrationTypeListParams = {}): Promise<PaginatedResult<RegistrationType>> => {
    const response = await apiClient.get<ApiEnvelope<RegistrationTypesListEnvelope>>(
      buildUrl(API_ENDPOINTS.adminRegistrationTypes, params),
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

  getById: async (id: number): Promise<RegistrationType> => {
    const response = await apiClient.get<ApiEnvelope<RegistrationType>>(
      buildUrl(API_ENDPOINTS.adminRegistrationTypeById, { id }),
    );
    return unwrapEnvelope(response);
  },

  create: async (payload: CreateRegistrationTypeRequest): Promise<RegistrationType> => {
    const response = await apiClient.post<ApiEnvelope<RegistrationType>>(
      API_ENDPOINTS.adminRegistrationTypes,
      payload,
    );
    return unwrapEnvelope(response);
  },

  update: async (id: number, payload: UpdateRegistrationTypeRequest): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminRegistrationTypeById, { id }), payload);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminRegistrationTypeById, { id }));
  },
};

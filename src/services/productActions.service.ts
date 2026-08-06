import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope } from '../types/api.types';
import type {
  ProductAction,
  ProductActionListParams,
  UpdateProductActionRequest,
} from '../types/productAction.types';

export const productActionsService = {
  // Unpaginated — see the note in productAction.types.ts.
  list: async (params: ProductActionListParams = {}): Promise<ProductAction[]> => {
    const response = await apiClient.get<ApiEnvelope<ProductAction[]>>(
      buildUrl(API_ENDPOINTS.adminProductActions, params),
    );
    return unwrapEnvelope(response);
  },

  getById: async (id: number): Promise<ProductAction> => {
    const response = await apiClient.get<ApiEnvelope<ProductAction>>(
      buildUrl(API_ENDPOINTS.adminProductActionById, { id }),
    );
    return unwrapEnvelope(response);
  },

  // adminUpdate() returns the saved entity directly too (not { data, message }).
  update: async (id: number, payload: UpdateProductActionRequest): Promise<ProductAction> => {
    const response = await apiClient.patch<ApiEnvelope<ProductAction>>(
      buildUrl(API_ENDPOINTS.adminProductActionById, { id }),
      payload,
    );
    return unwrapEnvelope(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminProductActionById, { id }));
  },
};

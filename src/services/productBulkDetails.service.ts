import { apiClient, unwrapData } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, ServiceResult } from '../types/api.types';
import type {
  CreateProductBulkDetailRequest,
  ProductBulkDetail,
  ProductBulkDetailListParams,
  UpdateProductBulkDetailRequest,
} from '../types/productBulkDetail.types';

export const productBulkDetailsService = {
  list: async (params: ProductBulkDetailListParams = {}): Promise<ProductBulkDetail[]> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<ProductBulkDetail[]>>>(
      buildUrl(API_ENDPOINTS.adminProductBulkDetails, params),
    );
    return unwrapData(response);
  },

  getById: async (id: number): Promise<ProductBulkDetail> => {
    const response = await apiClient.get<ApiEnvelope<ServiceResult<ProductBulkDetail>>>(
      buildUrl(API_ENDPOINTS.adminProductBulkDetailById, { id }),
    );
    return unwrapData(response);
  },

  create: async (payload: CreateProductBulkDetailRequest): Promise<ProductBulkDetail> => {
    const response = await apiClient.post<ApiEnvelope<ServiceResult<ProductBulkDetail>>>(
      API_ENDPOINTS.adminProductBulkDetails,
      payload,
    );
    return unwrapData(response);
  },

  // A duplicate (productId, packageQuantity) pair throws a 409 ConflictException
  // server-side — surfaces automatically as a toast via the response interceptor.
  update: async (id: number, payload: UpdateProductBulkDetailRequest): Promise<ProductBulkDetail> => {
    const response = await apiClient.patch<ApiEnvelope<ServiceResult<ProductBulkDetail>>>(
      buildUrl(API_ENDPOINTS.adminProductBulkDetailById, { id }),
      payload,
    );
    return unwrapData(response);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminProductBulkDetailById, { id }));
  },
};

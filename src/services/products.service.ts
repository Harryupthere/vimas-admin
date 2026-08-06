import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  CreateProductRequest,
  Product,
  ProductListParams,
  UpdateProductRequest,
  UpdateProductStatusRequest,
} from '../types/product.types';

// ProductsService.findAll() nests { products, page, limit, total } inside
// `data` — note there's no total_pages field here (unlike users/orders),
// so it's computed client-side.
interface ProductsListPayload {
  products: Product[];
  page: number;
  limit: number;
  total: number;
}

export const productsService = {
  list: async (params: ProductListParams = {}): Promise<PaginatedResult<Product>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: ProductsListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminProducts, params),
    );
    const payload = unwrapEnvelope(response).data;
    const limit = payload.limit || payload.products.length || 1;
    return {
      items: payload.products,
      total: payload.total,
      page: payload.page,
      limit,
      totalPages: Math.max(1, Math.ceil(payload.total / limit)),
    };
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<ApiEnvelope<{ data: Product; message: string }>>(
      buildUrl(API_ENDPOINTS.adminProductById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  create: async (payload: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<ApiEnvelope<{ data: Product; message: string }>>(
      API_ENDPOINTS.adminProducts,
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  update: async (id: number, payload: UpdateProductRequest): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminProductById, { id }), payload);
  },

  updateStatus: async (id: number, payload: UpdateProductStatusRequest): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminProductById, { id }), payload);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminProductById, { id }));
  },
};

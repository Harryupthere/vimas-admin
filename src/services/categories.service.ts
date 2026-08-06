import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  Category,
  CategoryListParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

// CategoryService.findAll() nests { category, page, limit, total, total_pages }
// inside `data` — note the key is singular "category", not "categories".
interface CategoriesListPayload {
  category: Category[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const categoriesService = {
  list: async (params: CategoryListParams = {}): Promise<PaginatedResult<Category>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: CategoriesListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminCategories, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.category,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiEnvelope<{ data: Category; message: string }>>(
      buildUrl(API_ENDPOINTS.adminCategoryById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  create: async (payload: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<ApiEnvelope<{ data: Category; message: string }>>(
      API_ENDPOINTS.adminCategoryCreate,
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  update: async (id: number, payload: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.patch<ApiEnvelope<{ data: Category; message: string }>>(
      buildUrl(API_ENDPOINTS.adminCategoryById, { id }),
      payload,
    );
    return unwrapEnvelope(response).data;
  },
};

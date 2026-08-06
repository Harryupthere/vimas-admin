import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { Category } from '../types/category.types';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type {
  Brand,
  BrandListParams,
  CategoryBrandMappingRequest,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '../types/brand.types';

// BrandService.findAll() nests { brand, page, limit, total, total_pages }
// inside `data` — key is singular "brand".
interface BrandsListPayload {
  brand: Brand[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const brandsService = {
  list: async (params: BrandListParams = {}): Promise<PaginatedResult<Brand>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: BrandsListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminBrands, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.brand,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  getById: async (id: number): Promise<Brand> => {
    const response = await apiClient.get<ApiEnvelope<{ data: Brand; message: string }>>(
      buildUrl(API_ENDPOINTS.adminBrandById, { id }),
    );
    return unwrapEnvelope(response).data;
  },

  create: async (payload: CreateBrandRequest): Promise<Brand> => {
    const response = await apiClient.post<ApiEnvelope<{ data: Brand; message: string }>>(
      API_ENDPOINTS.adminBrandCreate,
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  update: async (id: number, payload: UpdateBrandRequest): Promise<Brand> => {
    const response = await apiClient.patch<ApiEnvelope<{ data: Brand; message: string }>>(
      buildUrl(API_ENDPOINTS.adminBrandById, { id }),
      payload,
    );
    return unwrapEnvelope(response).data;
  },

  getCategoriesForBrand: async (brandId: number): Promise<Category[]> => {
    const response = await apiClient.get<ApiEnvelope<{ data: Category[]; message: string }>>(
      buildUrl(API_ENDPOINTS.adminBrandCategory, { id: brandId }),
    );
    return unwrapEnvelope(response).data;
  },

  // NOTE: Backend/src/brand/admin/brand.controller.ts's addMapping() handler
  // ignores the request body and always constructs `new CreateCategoryBrandDto()`
  // (empty), so category_id/brand_id never reach the service — this call will
  // 404 "Category not found" until that's fixed server-side. Wiring it
  // correctly here regardless, per the documented request contract, so it
  // starts working the moment the backend bug is fixed.
  mapCategory: async (payload: CategoryBrandMappingRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.adminBrandCategoryMap, payload);
  },

  unmapCategory: async (payload: CategoryBrandMappingRequest): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.adminBrandCategoryMap, { data: payload });
  },
};

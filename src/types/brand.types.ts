// Matches Backend/src/shared/entities/brand.entity.ts

export interface Brand {
  id: number;
  name: string;
  createdAt: string;
}

export interface BrandListParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateBrandRequest {
  name: string;
}

export type UpdateBrandRequest = CreateBrandRequest;

export interface CategoryBrandMappingRequest {
  categoryId: number;
  brandId: number;
}

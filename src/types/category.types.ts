// Matches Backend/src/shared/entities/categories.entity.ts +
// Backend/src/category/category.service.ts

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  parent?: Category | null;
  createdAt: string;
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateCategoryRequest {
  name: string;
  parent_id?: number;
}

export type UpdateCategoryRequest = CreateCategoryRequest;

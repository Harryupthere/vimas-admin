// Matches Backend/src/shared/entities/reward-mall-category.entity.ts. No
// pagination — findAll() returns the full filtered list (config-table
// pattern), optionally scoped by status.

export interface RewardMallCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  status: number;
  createdAt: string;
}

export interface CreateRewardMallCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  status?: number;
}

export type UpdateRewardMallCategoryRequest = Partial<CreateRewardMallCategoryRequest>;

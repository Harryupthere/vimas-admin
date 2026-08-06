// Matches Backend/src/shared/entities/user_types.entity.ts

export interface UserType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  key_points?: string[];
  status: number;
  createdAt: string;
}

export interface UserTypeListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateUserTypeRequest {
  name: string;
  description?: string;
  icon?: string;
  key_points?: string[];
  status?: number;
}

export type UpdateUserTypeRequest = Partial<CreateUserTypeRequest>;

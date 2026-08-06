// Matches Backend/src/shared/entities/membership-type.entity.ts

export interface MembershipType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  key_points?: string[];
  colour?: string;
  points_required?: number;
  created_at: string;
}

export interface MembershipTypeListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateMembershipTypeRequest {
  name: string;
  description?: string;
  icon?: string;
  key_points?: string[];
  colour?: string;
  points_required?: number;
}

export type UpdateMembershipTypeRequest = Partial<CreateMembershipTypeRequest>;

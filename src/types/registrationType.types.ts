// Matches Backend/src/shared/entities/registration_types.entity.ts

export interface RegistrationType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  status: number;
  createdAt: string;
}

export interface RegistrationTypeListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateRegistrationTypeRequest {
  name: string;
  description?: string;
  status?: number;
}

export type UpdateRegistrationTypeRequest = Partial<CreateRegistrationTypeRequest>;

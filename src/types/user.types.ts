// Matches Backend/src/shared/entities/user.entity.ts and the field list
// UsersService.findAll()/findOne() actually select (password is never
// returned). userType/registrationType are eager relations.

export interface UserTypeRef {
  id: number;
  name: string;
  description?: string;
}

export interface RegistrationTypeRef {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  unique_user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  telegram_id: string | null;
  phone_number: string | null;
  country: string | null;
  country_code: string | null;
  address: string | null;
  profile: string | null;
  email_verified: number;
  phone_number_verified: number;
  status: number;
  is_admin_deleted: number;
  is_self_deleted: number;
  admin_deleted_reason: string | null;
  self_deleted_reason: string | null;
  created_at: string;
  updated_at: string;
  userType: UserTypeRef | null;
  registrationType: RegistrationTypeRef | null;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  user_type?: string;
  [key: string]: string | number | boolean | undefined;
}

// Backend/src/users/dto/update-user.dto.ts — these are the ONLY fields
// PATCH /admin/user/:id accepts.
export interface UpdateUserRequest {
  status?: number;
  is_admin_deleted?: number;
  admin_deleted_reason?: string;
}

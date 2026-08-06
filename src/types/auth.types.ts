/**
 * The `admins` table (Backend/src/shared/entities/admin.entity.ts) only has
 * id/username/password/refresh_token — no name or email — and
 * AdminService.validateLogin() returns `user: admin.username` (a bare
 * string), not an admin object. So that's all the identity we ever get.
 */
export interface AdminUser {
  username: string;
}

export interface LoginPayload {
  access_token: string;
  refresh_token: string;
  user: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Shared API envelope types — confirmed against the backend source
 * (Backend/src/shared/interceptors/response.interceptor.ts +
 * Backend/src/shared/utils/response.util.ts), not guessed.
 *
 * Every HTTP response is wrapped ONCE by the global NestJS interceptor:
 *   { status: boolean, code: number, message: string, data: X }
 * `X` is whatever the controller method returns. Across this codebase,
 * almost every service method itself returns a second wrapper:
 *   X = { data: <payload>, message: string }
 * — but a few (e.g. user-types, membership-types) flatten pagination
 * fields as siblings of `data` instead of nesting them inside it, and a
 * few mutations (e.g. change-password) return only `{ message }` with no
 * `data` at all. Because this varies per resource, there is no single
 * generic unwrapper that is safe everywhere — each service.ts unwraps
 * explicitly, using `unwrapEnvelope` below plus its own known shape,
 * cross-checked against the matching Backend/src/**\/*.service.ts file.
 */

export interface ApiEnvelope<T> {
  status: boolean;
  code: number;
  message: string;
  data: T;
}

/** The common (but not universal) inner service-layer wrapper. */
export interface ServiceResult<T> {
  data: T;
  message: string;
}

/** Frontend-normalized shape every list service settles into, regardless
 *  of how the backend nested/named things for that particular resource. */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ApiError {
  status: number | null;
  message: string;
}

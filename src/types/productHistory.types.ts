// Matches Backend/src/shared/entities/product-history.entity.ts — read-only,
// no admin write endpoints (rows are written internally by other services).

export interface ProductHistory {
  id: number;
  productId: number;
  tableName: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  createdAt: string;
}

export interface ProductHistoryListParams {
  page?: number;
  limit?: number;
  productId?: number;
  [key: string]: string | number | boolean | undefined;
}

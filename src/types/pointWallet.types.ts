// Matches Backend/src/shared/entities/point-user-balance.entity.ts and
// point-admin-balance.entity.ts. Both paginated, both keyed by a unique
// owner id (userId / adminId) — one balance row per owner.

export interface PointUserBalance {
  id: number;
  userId: number;
  user?: { id: number; username?: string; email?: string };
  totalCredit: number;
  totalDebit: number;
  currentBalance: number;
  createdAt: string;
}

export interface PointAdminBalance {
  id: number;
  adminId: number;
  admin?: { id: number; username?: string };
  totalCredit: number;
  totalDebit: number;
  currentBalance: number;
  createdAt: string;
}

export interface PointBalanceListParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface CreatePointUserBalanceRequest {
  userId: number;
  totalCredit?: number;
  totalDebit?: number;
  currentBalance?: number;
}

export interface CreatePointAdminBalanceRequest {
  adminId: number;
  totalCredit?: number;
  totalDebit?: number;
  currentBalance?: number;
}

// userId/adminId deliberately excluded — the backend DTOs forbid reassigning
// ownership of an existing balance row via update.
export interface UpdatePointBalanceRequest {
  totalCredit?: number;
  totalDebit?: number;
  currentBalance?: number;
}

// Matches Backend/src/shared/entities/point-pool.entity.ts. Paginated.

export type PointPoolStatus = 'active' | 'inactive' | 'completed' | 'cancelled';

export interface PointPoolDetailRef {
  id: number;
  name: string;
  type: string;
}

export interface PointPool {
  id: number;
  poolDetailId: number;
  poolDetail?: PointPoolDetailRef;
  fromDatetime: string;
  toDatetime: string;
  totalUsers: number;
  totalAdmins: number;
  totalCredit: number;
  totalDebit: number;
  currentBalance: number;
  distributedPoints: number;
  status: PointPoolStatus;
  createdAt: string;
}

export interface PointPoolListParams {
  page?: number;
  limit?: number;
  status?: PointPoolStatus;
  [key: string]: string | number | boolean | undefined;
}

export interface CreatePointPoolRequest {
  poolDetailId: number;
  fromDatetime: string;
  toDatetime: string;
  totalUsers?: number;
  totalAdmins?: number;
  totalCredit?: number;
  totalDebit?: number;
  currentBalance?: number;
  distributedPoints?: number;
  status?: PointPoolStatus;
}

export type UpdatePointPoolRequest = Partial<CreatePointPoolRequest>;

export const POINT_POOL_STATUSES: PointPoolStatus[] = ['active', 'inactive', 'completed', 'cancelled'];

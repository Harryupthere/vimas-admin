// Matches Backend/src/shared/entities/point-pool-detail.entity.ts. No pagination.

export type PointPoolDetailType =
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'yearly';

export type PointPoolDetailStatus = 'active' | 'inactive';

export interface PointPoolDetail {
  id: number;
  type: PointPoolDetailType;
  name: string;
  description: string | null;
  symbol: string | null;
  colour: string | null;
  status: PointPoolDetailStatus;
  createdAt: string;
}

export interface CreatePointPoolDetailRequest {
  type: PointPoolDetailType;
  name: string;
  description?: string;
  symbol?: string;
  colour?: string;
  status?: PointPoolDetailStatus;
}

export type UpdatePointPoolDetailRequest = Partial<CreatePointPoolDetailRequest>;

export const POINT_POOL_DETAIL_TYPES: PointPoolDetailType[] = [
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'half_yearly',
  'yearly',
];

// Matches Backend/src/shared/entities/point-distribution.entity.ts. No
// pagination — findAll() returns the full filtered list.

export type PointEventType =
  | 'BUY_PRODUCT'
  | 'SELL_PRODUCT'
  | 'REFERRAL'
  | 'POOL_DISTRIBUTION'
  | 'ADMIN_ADJUSTMENT'
  | 'BONUS'
  | 'REFUND'
  | 'OTHER';

export type PointReceiverType = 'BUYER' | 'MERCHANT' | 'UPLINE_LEVEL_1' | 'UPLINE_LEVEL_2' | 'POOL' | 'ADMIN';

export type PointDistributionStatus = 'active' | 'inactive';

export interface PointDistribution {
  id: number;
  name: string;
  description: string | null;
  symbol: string | null;
  colour: string | null;
  eventType: PointEventType;
  receiverType: PointReceiverType;
  points: number;
  pointsPercentage: number;
  priority: number;
  status: PointDistributionStatus;
  createdAt: string;
}

export interface CreatePointDistributionRequest {
  name: string;
  description?: string;
  symbol?: string;
  colour?: string;
  eventType: PointEventType;
  receiverType: PointReceiverType;
  pointsPercentage: number;
  priority?: number;
  status?: PointDistributionStatus;
}

export type UpdatePointDistributionRequest = Partial<CreatePointDistributionRequest>;

export const POINT_EVENT_TYPES: PointEventType[] = [
  'BUY_PRODUCT',
  'SELL_PRODUCT',
  'REFERRAL',
  'POOL_DISTRIBUTION',
  'ADMIN_ADJUSTMENT',
  'BONUS',
  'REFUND',
  'OTHER',
];

export const POINT_RECEIVER_TYPES: PointReceiverType[] = [
  'BUYER',
  'MERCHANT',
  'UPLINE_LEVEL_1',
  'UPLINE_LEVEL_2',
  'POOL',
  'ADMIN',
];

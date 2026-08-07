// Matches Backend/src/shared/entities/reward-mall-purchase-status.entity.ts.
// No pagination.

export interface RewardMallPurchaseStatus {
  id: number;
  name: string;
  description: string | null;
  colour: string | null;
  icon: string | null;
  symbol: string | null;
  status: number;
  createdAt: string;
}

export interface CreateRewardMallPurchaseStatusRequest {
  name: string;
  description?: string;
  colour?: string;
  icon?: string;
  symbol?: string;
  status?: number;
}

export type UpdateRewardMallPurchaseStatusRequest = Partial<CreateRewardMallPurchaseStatusRequest>;

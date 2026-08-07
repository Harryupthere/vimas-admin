// Matches Backend/src/shared/entities/reward-mall-purchase.entity.ts.
// Paginated. Admin can only read + update fulfilment fields — purchases are
// created exclusively by buyers redeeming points (POST /reward-mall-purchases,
// user-side only), and there's no admin delete either.

export interface RewardMallPurchaseUserRef {
  id: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface RewardMallPurchaseProductRef {
  id: number;
  name: string;
  pointPrice?: number;
}

export interface RewardMallPurchaseStatusRef {
  id: number;
  name: string;
  colour?: string;
}

export interface RewardMallPurchase {
  id: number;
  userId: number;
  user?: RewardMallPurchaseUserRef;
  rewardMallProductId: number;
  product?: RewardMallPurchaseProductRef;
  quantity: number;
  pointsRedeemed: number;
  statusId: number;
  status?: RewardMallPurchaseStatusRef;
  trackingNumber: string | null;
  adminRemark: string[] | null;
  userRemark: string[] | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RewardMallPurchaseListParams {
  page?: number;
  limit?: number;
  userId?: number;
  statusId?: number;
  [key: string]: string | number | boolean | undefined;
}

// Backend/src/reward-mall-purchases/dto/admin-update-reward-mall-purchase.dto.ts
// — adminRemark is APPENDED to the existing array server-side, not replaced.
export interface AdminUpdateRewardMallPurchaseRequest {
  statusId?: number;
  trackingNumber?: string;
  adminRemark?: string[];
  deliveredAt?: string;
}

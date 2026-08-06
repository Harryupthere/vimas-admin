// Matches Backend/src/shared/entities/product-action.entity.ts.
// GET /admin/product-actions returns a bare array (ProductActionsService.adminList()
// returns qb.getMany() directly, not wrapped in { data, message }) — no pagination.

export interface ProductActionProductRef {
  id: number;
  name: string;
}

export interface ProductAction {
  id: number;
  productId: number;
  product?: ProductActionProductRef;
  currentStage: number; // 0 = listing, 1 = update
  currentStatus: number; // 0 = inactive, 1 = active
  attemptType: number; // 0 = new, 1 = reattempt
  adminRemarks: string[] | null;
  merchantRemarks: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductActionListParams {
  status?: number;
  stage?: number;
  [key: string]: string | number | boolean | undefined;
}

// Backend/src/product-action/dto/admin-update-product-action.dto.ts —
// adminRemarks is APPENDED to the existing array server-side, not replaced.
export interface UpdateProductActionRequest {
  currentStatus?: number;
  currentStage?: number;
  adminRemarks?: string[];
}

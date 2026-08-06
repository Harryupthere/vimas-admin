// Matches Backend/src/shared/entities/order-status.entity.ts. No pagination —
// findAll() returns the full flat list (config-table pattern).

export interface OrderStatus {
  id: number;
  name: string;
  description: string | null;
  remark: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreateOrderStatusRequest {
  name: string;
  description?: string;
}

export type UpdateOrderStatusRequest = Partial<CreateOrderStatusRequest>;

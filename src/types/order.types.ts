// Matches Backend/src/shared/entities/order.entity.ts

export interface OrderStatusRef {
  id: number;
  name: string;
  description?: string;
}

export interface PaymentStatusRef {
  id: number;
  name: string;
  colour?: string;
}

export type OrderProductType = 'reseller' | 'consumer' | 'partner';

export interface Order {
  id: number;
  // FK -> order_snapshots(id); null for orders placed before snapshotting existed.
  orderSnapshotId?: number | null;
  productType: OrderProductType;
  buyerId: number;
  buyer?: { id: number; username?: string; email?: string; first_name?: string; last_name?: string };
  productId: number;
  product?: { id: number; name: string };
  paymentOptionId: number;
  paymentStatusId: number;
  paymentStatus?: PaymentStatusRef;
  orderStatusId: number;
  orderStatus?: OrderStatusRef;
  quantity: number;
  singleUnitPrice: number;
  totalAmount: number;
  totalAmountPaid: number;
  createdAt: string;
  lastUpdate: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

// Backend/src/orders/dto/admin-update-order.dto.ts
export interface UpdateOrderStatusRequest {
  orderStatusId?: number;
  paymentStatusId?: number;
}

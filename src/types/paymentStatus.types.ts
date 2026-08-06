// Matches Backend/src/shared/entities/payment-status.entity.ts. No pagination.

export interface PaymentStatus {
  id: number;
  name: string;
  description: string | null;
  colour: string | null;
  remark: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreatePaymentStatusRequest {
  name: string;
  description?: string;
  colour?: string;
}

export type UpdatePaymentStatusRequest = Partial<CreatePaymentStatusRequest>;

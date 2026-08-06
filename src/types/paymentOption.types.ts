// Matches Backend/src/shared/entities/payment-option.entity.ts. No pagination.

export interface PaymentOption {
  id: number;
  name: string;
  description: string | null;
  note: string[] | null;
  charges: number;
  createdAt: string;
}

export interface CreatePaymentOptionRequest {
  name: string;
  description: string;
  note?: string[];
  charges?: number;
}

export type UpdatePaymentOptionRequest = Partial<CreatePaymentOptionRequest>;

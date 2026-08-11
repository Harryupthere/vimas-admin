// Matches Backend/src/shared/entities/payment-option.entity.ts. No
// pagination — findAll() returns the full filtered list, optionally
// scoped by search and/or status.

export interface PaymentOption {
  id: number;
  name: string;
  description: string | null;
  note: string[] | null;
  charges: number;
  status: number;
  createdAt: string;
}

export interface PaymentOptionListParams {
  search?: string;
  status?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface CreatePaymentOptionRequest {
  name: string;
  description: string;
  note?: string[];
  charges?: number;
  status?: number;
}

export type UpdatePaymentOptionRequest = Partial<CreatePaymentOptionRequest>;

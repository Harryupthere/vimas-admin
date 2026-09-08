// Matches Backend/src/shared/entities/product-payment-option.entity.ts —
// the join table mapping a Product to a PaymentOption (unique per pair).
//
// The admin controller (Backend/src/product-payment-option/admin/product-payment-option.controller.ts)
// routes POST (create), DELETE :id (remove), and GET :id (findOne). Note
// DELETE's :id is the product_payment_options row's own id, not product_id
// or payment_option_id — this is a 1-to-many per product, so it targets one
// specific link row. GET :id, by contrast, takes a product_id and returns
// that product's mapped payment options (used to populate the payment
// option dropdown in Product Extra Charges) — see
// adminProductPaymentOptionsByProduct in services/endpoints.ts. Mapped
// options also still arrive embedded in a product's own `paymentOptions`
// relation (Products admin findOne/findAll include `paymentOptions.paymentOption`).
import type { PaymentOption } from './paymentOption.types';

export interface ProductPaymentOption {
  id: number;
  product_id: number;
  payment_option_id: number;
  paymentOption?: PaymentOption;
  createdAt: string;
}

export interface CreateProductPaymentOptionRequest {
  product_id: number;
  payment_option_id: number;
}

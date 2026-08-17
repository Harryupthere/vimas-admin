// Matches Backend/src/shared/enums/product-type.enum.ts. Shared by the four
// product pricing config tables (product_extra_charges, product_add_ons,
// product_coupons, product_discounts) — each row is scoped to a product AND
// one of these types, deliberately UPPERCASE (distinct from cart's lowercase
// CartType). RESELLER pairs with product.bulkAvailable, CONSUMER with
// product.consumerAvailable, PARTNER with product.partnerAvailable — see
// utils/productType.ts for the gating logic driven by those flags.

export type ProductType = 'CONSUMER' | 'PARTNER' | 'RESELLER';

export const PRODUCT_TYPES: ProductType[] = ['CONSUMER', 'PARTNER', 'RESELLER'];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  RESELLER: 'Reseller (Bulk)',
  CONSUMER: 'Consumer',
  PARTNER: 'Partner',
};

// Minimal product shape these pricing pages need for the "pick a product,
// then choose which type(s) it's sold as" flow.
export interface ProductAvailabilityRef {
  id: number;
  name: string;
  bulkAvailable?: number;
  consumerAvailable?: number;
  partnerAvailable?: number;
}

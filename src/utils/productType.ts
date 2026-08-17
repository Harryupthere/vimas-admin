import { PRODUCT_TYPE_LABELS, type ProductAvailabilityRef, type ProductType } from '../types/productType.types';

export interface ProductTypeOption {
  value: ProductType;
  label: string;
}

const ORDERED_TYPES: ProductType[] = ['RESELLER', 'CONSUMER', 'PARTNER'];

/** Which of RESELLER/CONSUMER/PARTNER a given product is actually sold as,
 *  gated by its bulkAvailable/consumerAvailable/partnerAvailable flags — the
 *  same gating ProductsService uses for the buyer-facing listings. Used to
 *  narrow the "Product Type" dropdown on the pricing config pages (extra
 *  charges, add-ons, coupons, discounts) down to only the types a selected
 *  product can actually be priced for. With no product selected yet, all
 *  three are offered. */
export function getAvailableProductTypeOptions(product: ProductAvailabilityRef | undefined | null): ProductTypeOption[] {
  const types = !product
    ? ORDERED_TYPES
    : ORDERED_TYPES.filter((type) => {
        if (type === 'RESELLER') return !!product.bulkAvailable;
        if (type === 'CONSUMER') return !!product.consumerAvailable;
        return !!product.partnerAvailable;
      });

  return types.map((value) => ({ value, label: PRODUCT_TYPE_LABELS[value] }));
}

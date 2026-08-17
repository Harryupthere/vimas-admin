import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { toApiError } from '../../services/api';
import { productCouponsService } from '../../services/productCoupons.service';
import { productsService } from '../../services/products.service';
import type { CreateProductCouponRequest, ProductCoupon } from '../../types/productCoupon.types';
import type { ProductType } from '../../types/productType.types';
import { getAvailableProductTypeOptions } from '../../utils/productType';
import { productCouponSchema, type ProductCouponFormValues } from './productCoupon.schema';
import styles from './ProductCoupons.module.scss';

export interface ProductCouponFormModalProps {
  open: boolean;
  coupon: ProductCoupon | null;
  defaultProductId?: number;
  onClose: () => void;
}

// datetime-local inputs need "YYYY-MM-DDTHH:mm", ISO strings from the API
// carry seconds/timezone — trim to what the input accepts.
function toLocalInputValue(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ProductCouponFormModal({ open, coupon, defaultProductId, onClose }: ProductCouponFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = coupon !== null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductCouponFormValues>({ resolver: zodResolver(productCouponSchema) });

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.list({ page: 1, limit: 200 }),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      const initialProductId = coupon?.productId ?? defaultProductId;
      reset({
        productId: initialProductId ? String(initialProductId) : '',
        code: coupon?.code ?? '',
        name: coupon?.name ?? '',
        description: coupon?.description ?? '',
        productType: coupon?.productType ?? '',
        discountType: coupon?.discountType ?? 'PERCENTAGE',
        percentage: coupon?.percentage ?? 0,
        amount: coupon?.amount ?? 0,
        minimumQuantity: coupon?.minimumQuantity ?? undefined,
        maximumDiscountAmount: coupon?.maximumDiscountAmount ?? undefined,
        usageLimit: coupon?.usageLimit ?? undefined,
        startAt: toLocalInputValue(coupon?.startAt),
        endAt: toLocalInputValue(coupon?.endAt),
        isActive: coupon?.isActive ?? 1,
      });
    }
  }, [open, coupon, defaultProductId, reset]);

  const selectedProductId = watch('productId');
  const discountType = watch('discountType');

  const selectedProduct = useMemo(
    () => productsQuery.data?.items.find((p) => String(p.id) === selectedProductId),
    [productsQuery.data, selectedProductId],
  );

  const productTypeOptions = useMemo(() => getAvailableProductTypeOptions(selectedProduct), [selectedProduct]);

  useEffect(() => {
    const current = watch('productType');
    if (current && !productTypeOptions.some((opt) => opt.value === current)) {
      setValue('productType', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTypeOptions]);

  const mutation = useMutation({
    mutationFn: (values: ProductCouponFormValues) => {
      const payload: CreateProductCouponRequest = {
        ...values,
        productId: Number(values.productId),
        productType: values.productType as ProductType,
        discountType: values.discountType as CreateProductCouponRequest['discountType'],
        code: values.code.toUpperCase(),
        startAt: values.startAt ? new Date(values.startAt).toISOString() : undefined,
        endAt: values.endAt ? new Date(values.endAt).toISOString() : undefined,
      };
      return isEdit ? productCouponsService.update(coupon!.id, payload) : productCouponsService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Coupon updated.' : 'Coupon created.');
      queryClient.invalidateQueries({ queryKey: ['productCoupons'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Coupon' : 'Add Coupon'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <div className={styles.row}>
          <Select
            label="Product"
            required
            disabled={isEdit}
            placeholder="Select a product"
            hint={isEdit ? 'Cannot be changed after creation.' : 'Pick the product this coupon applies to.'}
            options={(productsQuery.data?.items ?? []).map((p) => ({ value: String(p.id), label: p.name }))}
            error={errors.productId?.message}
            {...register('productId')}
          />
          <Select
            label="Product Type"
            required
            placeholder={selectedProductId ? 'Select a type' : 'Select a product first'}
            disabled={!selectedProductId || productTypeOptions.length === 0}
            hint={
              selectedProductId && productTypeOptions.length === 0
                ? 'This product is not enabled for reseller, consumer, or partner sale.'
                : 'Only types this product is available for are shown.'
            }
            options={productTypeOptions}
            error={errors.productType?.message}
            {...register('productType')}
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Code"
            required
            hint="Buyers enter this at checkout, e.g. SAVE10."
            error={errors.code?.message}
            {...register('code')}
          />
          <Input label="Name" required error={errors.name?.message} {...register('name')} />
        </div>

        <Textarea label="Description" rows={2} {...register('description')} />

        <Select
          label="Discount Type"
          options={[
            { value: 'PERCENTAGE', label: 'Percentage' },
            { value: 'AMOUNT', label: 'Flat Amount' },
          ]}
          {...register('discountType')}
        />

        {discountType === 'AMOUNT' ? (
          <Input label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register('amount')} />
        ) : (
          <div className={styles.row}>
            <Input label="Percentage" type="number" step="0.01" error={errors.percentage?.message} {...register('percentage')} />
            <Input
              label="Maximum Discount Amount"
              type="number"
              step="0.01"
              hint="Caps the discount when it's percentage-based."
              {...register('maximumDiscountAmount')}
            />
          </div>
        )}

        <div className={styles.row}>
          <Input label="Minimum Quantity" type="number" {...register('minimumQuantity')} />
          <Input label="Usage Limit" type="number" hint="Total number of times this coupon can be used." {...register('usageLimit')} />
        </div>

        <div className={styles.row}>
          <Input label="Start At" type="datetime-local" {...register('startAt')} />
          <Input label="End At" type="datetime-local" {...register('endAt')} />
        </div>

        <Select
          label="Status"
          options={[
            { value: '1', label: 'Active' },
            { value: '0', label: 'Inactive' },
          ]}
          {...register('isActive')}
        />
      </form>
    </Modal>
  );
}

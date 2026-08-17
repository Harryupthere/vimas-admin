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
import { productDiscountsService } from '../../services/productDiscounts.service';
import { productsService } from '../../services/products.service';
import type { CreateProductDiscountRequest, ProductDiscount } from '../../types/productDiscount.types';
import type { ProductType } from '../../types/productType.types';
import { getAvailableProductTypeOptions } from '../../utils/productType';
import { productDiscountSchema, type ProductDiscountFormValues } from './productDiscount.schema';
import styles from './ProductDiscounts.module.scss';

export interface ProductDiscountFormModalProps {
  open: boolean;
  discount: ProductDiscount | null;
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

export function ProductDiscountFormModal({ open, discount, defaultProductId, onClose }: ProductDiscountFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = discount !== null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductDiscountFormValues>({ resolver: zodResolver(productDiscountSchema) });

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.list({ page: 1, limit: 200 }),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      const initialProductId = discount?.productId ?? defaultProductId;
      reset({
        productId: initialProductId ? String(initialProductId) : '',
        name: discount?.name ?? '',
        description: discount?.description ?? '',
        productType: discount?.productType ?? '',
        discountType: discount?.discountType ?? 'PERCENTAGE',
        percentage: discount?.percentage ?? 0,
        amount: discount?.amount ?? 0,
        minimumQuantity: discount?.minimumQuantity ?? undefined,
        maximumDiscountAmount: discount?.maximumDiscountAmount ?? undefined,
        startAt: toLocalInputValue(discount?.startAt),
        endAt: toLocalInputValue(discount?.endAt),
        isActive: discount?.isActive ?? 1,
      });
    }
  }, [open, discount, defaultProductId, reset]);

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
    mutationFn: (values: ProductDiscountFormValues) => {
      const payload: CreateProductDiscountRequest = {
        ...values,
        productId: Number(values.productId),
        productType: values.productType as ProductType,
        discountType: values.discountType as CreateProductDiscountRequest['discountType'],
        startAt: values.startAt ? new Date(values.startAt).toISOString() : undefined,
        endAt: values.endAt ? new Date(values.endAt).toISOString() : undefined,
      };
      return isEdit ? productDiscountsService.update(discount!.id, payload) : productDiscountsService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Discount updated.' : 'Discount created.');
      queryClient.invalidateQueries({ queryKey: ['productDiscounts'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Discount' : 'Add Discount'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Discount'}
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
            hint={isEdit ? 'Cannot be changed after creation.' : 'Pick the product this discount applies to.'}
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

        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <Textarea label="Description" rows={2} {...register('description')} />

        <Select
          label="Discount Type"
          hint="Applied automatically at checkout — no code needed."
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

        <Input label="Minimum Quantity" type="number" hint="Buyer must order at least this many units." {...register('minimumQuantity')} />

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

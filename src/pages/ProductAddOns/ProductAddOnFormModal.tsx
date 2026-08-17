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
import { productAddOnsService } from '../../services/productAddOns.service';
import { productsService } from '../../services/products.service';
import type { CreateProductAddOnRequest, ProductAddOn } from '../../types/productAddOn.types';
import type { ProductType } from '../../types/productType.types';
import { getAvailableProductTypeOptions } from '../../utils/productType';
import { productAddOnSchema, type ProductAddOnFormValues } from './productAddOn.schema';
import styles from './ProductAddOns.module.scss';

export interface ProductAddOnFormModalProps {
  open: boolean;
  addOn: ProductAddOn | null;
  defaultProductId?: number;
  onClose: () => void;
}

export function ProductAddOnFormModal({ open, addOn, defaultProductId, onClose }: ProductAddOnFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = addOn !== null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductAddOnFormValues>({ resolver: zodResolver(productAddOnSchema) });

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.list({ page: 1, limit: 200 }),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      const initialProductId = addOn?.productId ?? defaultProductId;
      reset({
        productId: initialProductId ? String(initialProductId) : '',
        name: addOn?.name ?? '',
        description: addOn?.description ?? '',
        symbol: addOn?.symbol ?? '',
        productType: addOn?.productType ?? '',
        calculationType: addOn?.calculationType ?? 'AMOUNT',
        percentage: addOn?.percentage ?? 0,
        amount: addOn?.amount ?? 0,
        costPerUnit: !!addOn?.costPerUnit,
        applicableMinimumQuantity: addOn?.applicableMinimumQuantity ?? undefined,
        isActive: addOn?.isActive ?? 1,
      });
    }
  }, [open, addOn, defaultProductId, reset]);

  const selectedProductId = watch('productId');
  const calculationType = watch('calculationType');

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
    mutationFn: (values: ProductAddOnFormValues) => {
      const payload: CreateProductAddOnRequest = {
        ...values,
        productId: Number(values.productId),
        productType: values.productType as ProductType,
        calculationType: values.calculationType as CreateProductAddOnRequest['calculationType'],
      };
      return isEdit ? productAddOnsService.update(addOn!.id, payload) : productAddOnsService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Add-on updated.' : 'Add-on created.');
      queryClient.invalidateQueries({ queryKey: ['productAddOns'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Add-On' : 'Add Add-On'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Add-On'}
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
            hint={isEdit ? 'Cannot be changed after creation.' : 'Pick the product this add-on applies to.'}
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
          <Input label="Name" required error={errors.name?.message} {...register('name')} />
          <Input label="Symbol" hint="Short code shown on receipts, e.g. GIFT_WRAP." {...register('symbol')} />
        </div>

        <Textarea label="Description" rows={2} {...register('description')} />

        <Select
          label="Calculation Type"
          hint="Whether the price below is a % of the item price or a flat amount."
          options={[
            { value: 'AMOUNT', label: 'Flat Amount' },
            { value: 'PERCENTAGE', label: 'Percentage' },
          ]}
          {...register('calculationType')}
        />

        {calculationType === 'PERCENTAGE' ? (
          <Input label="Percentage" type="number" step="0.01" error={errors.percentage?.message} {...register('percentage')} />
        ) : (
          <Input label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register('amount')} />
        )}

        <div className={styles.row}>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('costPerUnit')} />
            Apply per unit quantity (instead of once per line)
          </label>
          <Input
            label="Applicable Minimum Quantity"
            type="number"
            hint="Buyer must order at least this many units to see this add-on."
            {...register('applicableMinimumQuantity')}
          />
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

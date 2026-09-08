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
import { productExtraChargesService } from '../../services/productExtraCharges.service';
import { productPaymentOptionsService } from '../../services/productPaymentOptions.service';
import { productsService } from '../../services/products.service';
import type { CreateProductExtraChargeRequest, ProductExtraCharge } from '../../types/productExtraCharge.types';
import type { ProductType } from '../../types/productType.types';
import { getAvailableProductTypeOptions } from '../../utils/productType';
import { productExtraChargeSchema, type ProductExtraChargeFormValues } from './productExtraCharge.schema';
import styles from './ProductExtraCharges.module.scss';

export interface ProductExtraChargeFormModalProps {
  open: boolean;
  charge: ProductExtraCharge | null;
  defaultProductId?: number;
  onClose: () => void;
}

export function ProductExtraChargeFormModal({ open, charge, defaultProductId, onClose }: ProductExtraChargeFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = charge !== null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductExtraChargeFormValues>({ resolver: zodResolver(productExtraChargeSchema) });

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.list({ page: 1, limit: 200 }),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      const initialProductId = charge?.productId ?? defaultProductId;
      reset({
        productId: initialProductId ? String(initialProductId) : '',
        paymentOptionId: charge?.paymentOptionId ? String(charge.paymentOptionId) : '',
        name: charge?.name ?? '',
        description: charge?.description ?? '',
        symbol: charge?.symbol ?? '',
        productType: charge?.productType ?? '',
        calculationBasis: charge?.calculationBasis ?? 'PRODUCT',
        calculationType: charge?.calculationType ?? 'AMOUNT',
        amount: charge?.amount ?? 0,
        percentage: charge?.percentage ?? 0,
        fixedAmount: charge?.fixedAmount ?? 0,
        fixedAmountBasis: charge?.fixedAmountBasis ?? '',
        waiveAtQuantity: charge?.waiveAtQuantity ?? undefined,
        isActive: charge?.isActive ?? 1,
      });
    }
  }, [open, charge, defaultProductId, reset]);

  const selectedProductId = watch('productId');
  const calculationType = watch('calculationType');

  const selectedProduct = useMemo(
    () => productsQuery.data?.items.find((p) => String(p.id) === selectedProductId),
    [productsQuery.data, selectedProductId],
  );

  const productTypeOptions = useMemo(() => getAvailableProductTypeOptions(selectedProduct), [selectedProduct]);

  // If the selected product changes and its currently-chosen type is no
  // longer offered (e.g. that product isn't partner-available), clear it
  // rather than silently submitting a type the product doesn't support.
  useEffect(() => {
    const current = watch('productType');
    if (current && !productTypeOptions.some((opt) => opt.value === current)) {
      setValue('productType', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTypeOptions]);

  // Payment options are scoped to the selected product — an extra charge
  // targets one payment option that's already mapped to that product.
  const productPaymentOptionsQuery = useQuery({
    queryKey: ['productPaymentOptions', 'byProduct', selectedProductId],
    queryFn: () => productPaymentOptionsService.findByProduct(Number(selectedProductId)),
    enabled: open && !!selectedProductId,
  });

  const paymentOptionChoices = useMemo(
    () =>
      (productPaymentOptionsQuery.data ?? []).map((mapping) => ({
        value: String(mapping.payment_option_id),
        label: mapping.paymentOption?.name ?? `#${mapping.payment_option_id}`,
      })),
    [productPaymentOptionsQuery.data],
  );

  // Same guard as productType above: if the product changes and the
  // currently-chosen payment option isn't mapped to it, clear it. Only
  // once the mapping has actually loaded — otherwise the empty choices
  // during that first fetch would wrongly clear a value carried over from
  // an existing charge being edited.
  useEffect(() => {
    if (!productPaymentOptionsQuery.isSuccess) return;
    const current = watch('paymentOptionId');
    if (current && !paymentOptionChoices.some((opt) => opt.value === current)) {
      setValue('paymentOptionId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentOptionChoices, productPaymentOptionsQuery.isSuccess]);

  const mutation = useMutation({
    mutationFn: (values: ProductExtraChargeFormValues) => {
      const payload: CreateProductExtraChargeRequest = {
        ...values,
        productId: Number(values.productId),
        paymentOptionId: Number(values.paymentOptionId),
        productType: values.productType as ProductType,
        calculationBasis: values.calculationBasis as CreateProductExtraChargeRequest['calculationBasis'],
        calculationType: values.calculationType as CreateProductExtraChargeRequest['calculationType'],
        fixedAmountBasis: values.fixedAmountBasis ? (values.fixedAmountBasis as CreateProductExtraChargeRequest['fixedAmountBasis']) : undefined,
      };
      return isEdit ? productExtraChargesService.update(charge!.id, payload) : productExtraChargesService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Extra charge updated.' : 'Extra charge created.');
      queryClient.invalidateQueries({ queryKey: ['productExtraCharges'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Extra Charge' : 'Add Extra Charge'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Charge'}
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
            hint={isEdit ? 'Cannot be changed after creation.' : 'Pick the product this charge applies to.'}
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

        <Select
          label="Payment Option"
          required
          placeholder={
            !selectedProductId
              ? 'Select a product first'
              : productPaymentOptionsQuery.isLoading
                ? 'Loading payment options…'
                : 'Select a payment option'
          }
          disabled={!selectedProductId || productPaymentOptionsQuery.isLoading || paymentOptionChoices.length === 0}
          hint={
            selectedProductId && !productPaymentOptionsQuery.isLoading && paymentOptionChoices.length === 0
              ? 'This product has no payment options mapped yet — add one from Products first.'
              : 'Only payment options mapped to this product are shown.'
          }
          options={paymentOptionChoices}
          error={errors.paymentOptionId?.message}
          {...register('paymentOptionId')}
        />

        <div className={styles.row}>
          <Input label="Name" required error={errors.name?.message} {...register('name')} />
          <Input label="Symbol" hint="Short code shown on receipts, e.g. PROCESSING." {...register('symbol')} />
        </div>

        <Textarea label="Description" rows={2} {...register('description')} />

        <div className={styles.row}>
          <Select
            label="Calculation Basis"
            hint="Whether the charge is per unit or per line."
            options={[
              { value: 'PRODUCT', label: 'Per Product' },
              { value: 'QUANTITY', label: 'Per Quantity' },
            ]}
            {...register('calculationBasis')}
          />
          <Select
            label="Calculation Type"
            hint="Whether the primary charge below is a % or a flat amount."
            options={[
              { value: 'AMOUNT', label: 'Flat Amount' },
              { value: 'PERCENTAGE', label: 'Percentage' },
            ]}
            {...register('calculationType')}
          />
        </div>

        {calculationType === 'PERCENTAGE' ? (
          <Input label="Percentage" type="number" step="0.01" error={errors.percentage?.message} {...register('percentage')} />
        ) : (
          <Input label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register('amount')} />
        )}

        <div className={styles.row3}>
          <Input
            label="Fixed Amount"
            type="number"
            step="0.01"
            hint="Optional flat fee added on top."
            {...register('fixedAmount')}
          />
          <Select
            label="Fixed Amount Basis"
            placeholder="Same as calculation basis"
            options={[
              { value: 'PRODUCT', label: 'Per Product' },
              { value: 'QUANTITY', label: 'Per Quantity' },
            ]}
            {...register('fixedAmountBasis')}
          />
          <Input
            label="Waive At Quantity"
            type="number"
            hint="Charge is waived once quantity reaches this."
            {...register('waiveAtQuantity')}
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

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { toApiError } from '../../services/api';
import { productBulkDetailsService } from '../../services/productBulkDetails.service';
import { productsService } from '../../services/products.service';
import type { CreateProductBulkDetailRequest, ProductBulkDetail } from '../../types/productBulkDetail.types';
import { productBulkDetailSchema, type ProductBulkDetailFormValues } from './productBulkDetail.schema';
import styles from './ProductBulkDetails.module.scss';

export interface ProductBulkDetailFormModalProps {
  open: boolean;
  detail: ProductBulkDetail | null;
  defaultProductId?: number;
  onClose: () => void;
}

export function ProductBulkDetailFormModal({ open, detail, defaultProductId, onClose }: ProductBulkDetailFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = detail !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductBulkDetailFormValues>({ resolver: zodResolver(productBulkDetailSchema) });

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.list({ page: 1, limit: 200 }),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      const initialProductId = detail?.productId ?? defaultProductId;
      reset({
        productId: initialProductId ? String(initialProductId) : '',
        packageQuantity: detail?.packageQuantity ?? 0,
        unitPrice: detail?.unitPrice ?? 0,
        discountPercentage: detail?.discountPercentage ?? 0,
        freeQuantity: detail?.freeQuantity ?? 0,
        fees: detail?.fees ?? 0,
        totalPrice: detail?.totalPrice ?? 0,
        totalPoints: detail?.totalPoints ?? 0,
        // Backend defaults these two to true (unlike the product-level flags,
        // which default to false) — so a new tier starts with both checked.
        showTotalPoints: detail ? !!detail.showTotalPoints : true,
        showPointsSharing: detail ? !!detail.showPointsSharing : true,
        sortOrder: detail?.sortOrder ?? 0,
        status: detail?.status ?? 1,
      });
    }
  }, [open, detail, defaultProductId, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProductBulkDetailFormValues) => {
      const payload: CreateProductBulkDetailRequest = {
        ...values,
        productId: Number(values.productId),
      };
      return isEdit ? productBulkDetailsService.update(detail!.id, payload) : productBulkDetailsService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Bulk pricing tier updated.' : 'Bulk pricing tier created.');
      queryClient.invalidateQueries({ queryKey: ['productBulkDetails'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Bulk Pricing Tier' : 'Add Bulk Pricing Tier'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Tier'}
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
            hint={isEdit ? 'Cannot be changed after creation.' : undefined}
            options={(productsQuery.data?.items ?? []).map((p) => ({ value: String(p.id), label: p.name }))}
            error={errors.productId?.message}
            {...register('productId')}
          />
          <Input
            label="Package Quantity"
            type="number"
            required
            hint="Units per package (e.g. 10)."
            error={errors.packageQuantity?.message}
            {...register('packageQuantity')}
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Unit Price"
            type="number"
            step="0.01"
            required
            error={errors.unitPrice?.message}
            {...register('unitPrice')}
          />
          <Input
            label="Discount %"
            type="number"
            step="0.01"
            error={errors.discountPercentage?.message}
            {...register('discountPercentage')}
          />
        </div>

        <div className={styles.row}>
          <Input label="Free Quantity" type="number" {...register('freeQuantity')} />
          <Input label="Fees" type="number" step="0.01" {...register('fees')} />
        </div>

        <div className={styles.row3}>
          <Input label="Total Price" type="number" step="0.01" {...register('totalPrice')} />
          <Input label="Total Points" type="number" step="0.01" {...register('totalPoints')} />
          <Input label="Sort Order" type="number" {...register('sortOrder')} />
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('showTotalPoints')} />
            Show total points to buyers
          </label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('showPointsSharing')} />
            Show points-sharing breakdown to buyers
          </label>
        </div>

        <Select
          label="Status"
          options={[
            { value: '1', label: 'Active' },
            { value: '0', label: 'Inactive' },
          ]}
          {...register('status')}
        />
      </form>
    </Modal>
  );
}

import { useEffect } from 'react';
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
import { rewardMallCategoriesService } from '../../services/rewardMallCategories.service';
import { rewardMallProductsService } from '../../services/rewardMallProducts.service';
import type { CreateRewardMallProductRequest, RewardMallProduct } from '../../types/rewardMallProduct.types';
import { rewardMallProductSchema, type RewardMallProductFormValues } from './rewardMallProduct.schema';
import styles from './RewardMallProducts.module.scss';

export interface RewardMallProductFormModalProps {
  open: boolean;
  product: RewardMallProduct | null;
  onClose: () => void;
}

export function RewardMallProductFormModal({ open, product, onClose }: RewardMallProductFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = product !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RewardMallProductFormValues>({ resolver: zodResolver(rewardMallProductSchema) });

  useEffect(() => {
    if (!open) return;
    reset({
      categoryId: product?.categoryId ? String(product.categoryId) : '',
      name: product?.name ?? '',
      subTitle: product?.subTitle ?? '',
      description: product?.description ?? '',
      information: product?.information ?? '',
      notes: product?.notes ?? '',
      keyPoints: product?.keyPoints?.join('\n') ?? '',
      searchKeywords: product?.searchKeywords?.join('\n') ?? '',
      detailsJson: product?.details ? JSON.stringify(product.details, null, 2) : '',

      pointPrice: product?.pointPrice ?? 0,
      minimumQuantity: product?.minimumQuantity ?? 1,
      maximumQuantity: product?.maximumQuantity ?? 1,

      stock: product?.stock ?? 0,
      stockShow: !!product?.stockShow,
      isOutOfStock: !!product?.isOutOfStock,

      labelShow: !!product?.labelShow,
      labelText: product?.labelText ?? '',
      labelColor: product?.labelColor ?? '#000000',

      sortOrder: product?.sortOrder ?? 0,
    });
  }, [open, product, reset]);

  const categoriesQuery = useQuery({
    queryKey: ['rewardMallCategories', 'all'],
    queryFn: () => rewardMallCategoriesService.list(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async (values: RewardMallProductFormValues) => {
      const payload: CreateRewardMallProductRequest = {
        categoryId: Number(values.categoryId),
        name: values.name,
        subTitle: values.subTitle || undefined,
        description: values.description || undefined,
        information: values.information || undefined,
        notes: values.notes || undefined,
        keyPoints: values.keyPoints
          ? values.keyPoints.split('\n').map((l) => l.trim()).filter(Boolean)
          : undefined,
        searchKeywords: values.searchKeywords
          ? values.searchKeywords.split('\n').map((l) => l.trim()).filter(Boolean)
          : undefined,
        details: values.detailsJson?.trim() ? JSON.parse(values.detailsJson) : undefined,

        pointPrice: values.pointPrice,
        minimumQuantity: values.minimumQuantity,
        maximumQuantity: values.maximumQuantity,

        stock: values.stock,
        stockShow: values.stockShow,
        isOutOfStock: values.isOutOfStock,

        labelShow: values.labelShow,
        labelText: values.labelText || undefined,
        labelColor: values.labelColor || undefined,

        sortOrder: values.sortOrder,
      };
      if (isEdit) {
        await rewardMallProductsService.update(product!.id, payload);
      } else {
        await rewardMallProductsService.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Reward product updated.' : 'Reward product created.');
      queryClient.invalidateQueries({ queryKey: ['rewardMallProducts'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const onSubmit = (values: RewardMallProductFormValues) => mutation.mutate(values);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Reward Mall Product' : 'Add Reward Mall Product'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Select
          label="Category"
          required
          placeholder="Select a category"
          options={(categoriesQuery.data ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
          error={errors.categoryId?.message}
          {...register('categoryId')}
        />

        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <Input label="Subtitle" error={errors.subTitle?.message} {...register('subTitle')} />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />

        <div className={styles.sectionTitle}>Content</div>
        <Textarea label="Information" error={errors.information?.message} {...register('information')} />
        <Textarea label="Notes" error={errors.notes?.message} {...register('notes')} />
        <div className={styles.row}>
          <Textarea label="Key Points" hint="One per line." error={errors.keyPoints?.message} {...register('keyPoints')} />
          <Textarea
            label="Search Keywords"
            hint="One per line."
            error={errors.searchKeywords?.message}
            {...register('searchKeywords')}
          />
        </div>
        <Textarea
          label="Details (advanced)"
          hint='Raw JSON array, e.g. [{"label":"Weight","value":"500g"}]'
          className={styles.jsonTextarea}
          rows={4}
          error={errors.detailsJson?.message}
          {...register('detailsJson')}
        />

        <div className={styles.sectionTitle}>Points & Stock</div>
        <div className={styles.row3}>
          <Input
            label="Point Price"
            type="number"
            step="0.01"
            required
            hint="Cost per unit, in reward points."
            error={errors.pointPrice?.message}
            {...register('pointPrice')}
          />
          <Input label="Minimum Qty" type="number" error={errors.minimumQuantity?.message} {...register('minimumQuantity')} />
          <Input label="Maximum Qty" type="number" error={errors.maximumQuantity?.message} {...register('maximumQuantity')} />
        </div>
        <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('stockShow')} />
            Show stock count to buyers
          </label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('isOutOfStock')} />
            Mark as out of stock
          </label>
        </div>

        <div className={styles.sectionTitle}>Label</div>
        <div className={styles.row3}>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('labelShow')} />
            Show label
          </label>
          <Input label="Label Text" error={errors.labelText?.message} {...register('labelText')} />
          <Input label="Label Colour" type="color" {...register('labelColor')} />
        </div>

        <Input label="Sort Order" type="number" error={errors.sortOrder?.message} {...register('sortOrder')} />
      </form>
    </Modal>
  );
}

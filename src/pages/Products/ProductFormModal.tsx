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
import { brandsService } from '../../services/brands.service';
import { categoriesService } from '../../services/categories.service';
import { productsService } from '../../services/products.service';
import type { CreateProductRequest, Product } from '../../types/product.types';
import { productSchema, type ProductFormValues } from './product.schema';
import styles from './Products.module.scss';

export interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

export function ProductFormModal({ open, product, onClose }: ProductFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = product !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    if (!open) return;
    reset({
      name: product?.name ?? '',
      subTitle: product?.subTitle ?? '',
      description: product?.description ?? '',
      sellingPrice: product?.sellingPrice ?? 0,
      stock: product?.stock ?? 0,
      categoryId: product?.category ? String(product.category.id) : '',
      brandId: product?.brand ? String(product.brand.id) : '',
      totalPoints: product?.totalPoints ?? undefined,
      showTotalPoints: !!product?.showTotalPoints,
      showPointsSharing: !!product?.showPointsSharing,
    });
  }, [open, product, reset]);

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesService.list({ page: 1, limit: 200 }),
    enabled: open,
  });

  const brandsQuery = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => brandsService.list({ page: 1, limit: 200 }),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload: CreateProductRequest = {
        name: values.name,
        subTitle: values.subTitle || undefined,
        description: values.description || undefined,
        sellingPrice: values.sellingPrice,
        stock: values.stock,
        categoryId: Number(values.categoryId),
        brandId: values.brandId ? Number(values.brandId) : undefined,
        totalPoints: values.totalPoints,
        showTotalPoints: values.showTotalPoints,
        showPointsSharing: values.showPointsSharing,
      };
      if (isEdit) {
        await productsService.update(product!.id, payload);
      } else {
        await productsService.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated.' : 'Product created.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const onSubmit = (values: ProductFormValues) => mutation.mutate(values);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add Product'}
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
        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <Input label="Subtitle" error={errors.subTitle?.message} {...register('subTitle')} />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />

        <div className={styles.row}>
          <Input
            label="Selling Price"
            type="number"
            step="0.01"
            required
            error={errors.sellingPrice?.message}
            {...register('sellingPrice')}
          />
          <Input label="Stock" type="number" required error={errors.stock?.message} {...register('stock')} />
        </div>

        <div className={styles.row}>
          <Select
            label="Category"
            required
            placeholder="Select a category"
            options={(categoriesQuery.data?.items ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
            error={errors.categoryId?.message}
            {...register('categoryId')}
          />
          <Select
            label="Brand"
            placeholder="No brand"
            options={(brandsQuery.data?.items ?? []).map((b) => ({ value: String(b.id), label: b.name }))}
            {...register('brandId')}
          />
        </div>

        <Input
          label="Total Points"
          type="number"
          hint="Points pool (per unit) shared across buyer/upline/pool via active PointDistribution rules."
          error={errors.totalPoints?.message}
          {...register('totalPoints')}
        />

        <label className={styles.checkboxRow}>
          <input type="checkbox" {...register('showTotalPoints')} />
          Show total points to buyers
        </label>
        <label className={styles.checkboxRow}>
          <input type="checkbox" {...register('showPointsSharing')} />
          Show points-sharing breakdown to buyers
        </label>
      </form>
    </Modal>
  );
}

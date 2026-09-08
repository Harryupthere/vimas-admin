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
      information: product?.information ?? '',
      notes: product?.notes ?? '',
      keyPoints: product?.keyPoints?.join('\n') ?? '',
      searchKeywords: product?.searchKeywords?.join('\n') ?? '',
      detailsJson: product?.details ? JSON.stringify(product.details, null, 2) : '',

      sellingPrice: product?.sellingPrice ?? 0,
      discountAvailable: !!product?.discountAvailable,
      discountAmount: product?.discountAmount ?? undefined,
      discountPercentage: product?.discountPercentage ?? undefined,

      stock: product?.stock ?? 0,
      stockShow: !!product?.stockShow,
      isOutOfStock: !!product?.isOutOfStock,

      categoryId: product?.category ? String(product.category.id) : '',
      brandId: product?.brand ? String(product.brand.id) : '',

      totalPoints: product?.totalPoints ?? undefined,
      showTotalPoints: !!product?.showTotalPoints,
      showPointsSharing: !!product?.showPointsSharing,

      labelShow: !!product?.labelShow,
      labelText: product?.labelText ?? '',
      labelColor: product?.labelColor ?? '#000000',

      bulkAvailable: !!product?.bulkAvailable,
      // Entity defaults these two to 1 (available), unlike bulkAvailable's 0 —
      // so a new product starts with both checked, matching the DB default.
      consumerAvailable: product ? !!product.consumerAvailable : true,
      partnerAvailable: product ? !!product.partnerAvailable : true,
      consumerMinimumQuantity: product?.consumerMinimumQuantity ?? 1,
      consumerMaximumQuantity: product?.consumerMaximumQuantity ?? 1,
      resellerMinimumQuantity: product?.resellerMinimumQuantity ?? 1,
      resellerMaximumQuantity: product?.resellerMaximumQuantity ?? 1,
      partnerMinimumQuantity: product?.partnerMinimumQuantity ?? 1,
      partnerMaximumQuantity: product?.partnerMaximumQuantity ?? 1,
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
        information: values.information || undefined,
        notes: values.notes || undefined,
        keyPoints: values.keyPoints
          ? values.keyPoints.split('\n').map((l) => l.trim()).filter(Boolean)
          : undefined,
        searchKeywords: values.searchKeywords
          ? values.searchKeywords.split('\n').map((l) => l.trim()).filter(Boolean)
          : undefined,
        details: values.detailsJson?.trim() ? JSON.parse(values.detailsJson) : undefined,

        sellingPrice: values.sellingPrice,
        discountAvailable: values.discountAvailable,
        discountAmount: values.discountAmount,
        discountPercentage: values.discountPercentage,

        stock: values.stock,
        stockShow: values.stockShow,
        isOutOfStock: values.isOutOfStock ? 1 : 0,

        categoryId: Number(values.categoryId),
        brandId: values.brandId ? Number(values.brandId) : undefined,

        totalPoints: values.totalPoints,
        showTotalPoints: values.showTotalPoints,
        showPointsSharing: values.showPointsSharing,

        labelShow: values.labelShow,
        labelText: values.labelText || undefined,
        labelColor: values.labelColor || undefined,

        bulkAvailable: values.bulkAvailable,
        consumerAvailable: values.consumerAvailable,
        partnerAvailable: values.partnerAvailable,
        consumerMinimumQuantity: values.consumerMinimumQuantity,
        consumerMaximumQuantity: values.consumerMaximumQuantity,
        resellerMinimumQuantity: values.resellerMinimumQuantity,
        resellerMaximumQuantity: values.resellerMaximumQuantity,
        partnerMinimumQuantity: values.partnerMinimumQuantity,
        partnerMaximumQuantity: values.partnerMaximumQuantity,
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
        {isEdit && (product?.viewCount !== undefined || product?.likeCount !== undefined) && (
          <div className={styles.statsRow}>
            <span>👁 {product?.viewCount ?? 0} views</span>
            <span>♥ {product?.likeCount ?? 0} likes</span>
          </div>
        )}

        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <Input label="Subtitle" error={errors.subTitle?.message} {...register('subTitle')} />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />

        <div className={styles.sectionTitle}>Content</div>
        <Textarea label="Information" error={errors.information?.message} {...register('information')} />
        <Textarea label="Notes" error={errors.notes?.message} {...register('notes')} />
        <div className={styles.row}>
          <Textarea
            label="Key Points"
            hint="One per line."
            error={errors.keyPoints?.message}
            {...register('keyPoints')}
          />
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

        <div className={styles.sectionTitle}>Pricing & Stock</div>
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
          <Input
            label="Discount Amount"
            type="number"
            step="0.01"
            error={errors.discountAmount?.message}
            {...register('discountAmount')}
          />
          <Input
            label="Discount Percentage"
            type="number"
            step="0.01"
            error={errors.discountPercentage?.message}
            {...register('discountPercentage')}
          />
        </div>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('discountAvailable')} />
            Discount available
          </label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('stockShow')} />
            Show stock count to buyers
          </label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('isOutOfStock')} />
            Mark as out of stock
          </label>
        </div>

        <div className={styles.sectionTitle}>Category & Brand</div>
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

        <div className={styles.sectionTitle}>Points Sharing</div>
        <Input
          label="Total Points"
          type="number"
          hint="Points pool (per unit) shared across buyer/upline/pool via active PointDistribution rules."
          error={errors.totalPoints?.message}
          {...register('totalPoints')}
        />
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('showTotalPoints')} />
            Show total points to buyers
          </label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('showPointsSharing')} />
            Show points-sharing breakdown to buyers
          </label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('bulkAvailable')} />
            Available for bulk/reseller listing
          </label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('consumerAvailable')} />
            Available for consumer listing
          </label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('partnerAvailable')} />
            Available for partner listing
          </label>
        </div>
        <div className={styles.row}>
          <Input
            label="Consumer Minimum Quantity"
            type="number"
            error={errors.consumerMinimumQuantity?.message}
            {...register('consumerMinimumQuantity')}
          />
          <Input
            label="Consumer Maximum Quantity"
            type="number"
            error={errors.consumerMaximumQuantity?.message}
            {...register('consumerMaximumQuantity')}
          />
        </div>
        <div className={styles.row}>
          <Input
            label="Reseller Minimum Quantity"
            type="number"
            error={errors.resellerMinimumQuantity?.message}
            {...register('resellerMinimumQuantity')}
          />
          <Input
            label="Reseller Maximum Quantity"
            type="number"
            error={errors.resellerMaximumQuantity?.message}
            {...register('resellerMaximumQuantity')}
          />
        </div>
        <div className={styles.row}>
          <Input
            label="Partner Minimum Quantity"
            type="number"
            error={errors.partnerMinimumQuantity?.message}
            {...register('partnerMinimumQuantity')}
          />
          <Input
            label="Partner Maximum Quantity"
            type="number"
            error={errors.partnerMaximumQuantity?.message}
            {...register('partnerMaximumQuantity')}
          />
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
      </form>
    </Modal>
  );
}

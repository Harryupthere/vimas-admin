import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { SearchInput } from '../../components/SearchInput';
import { Select } from '../../components/Select';
import { StatusBadge, statusToneFromFlag } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { toApiError } from '../../services/api';
import { productCouponsService } from '../../services/productCoupons.service';
import { productsService } from '../../services/products.service';
import type { ProductCoupon } from '../../types/productCoupon.types';
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPES, type ProductType } from '../../types/productType.types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ProductCouponFormModal } from './ProductCouponFormModal';
import styles from './ProductCoupons.module.scss';

export default function ProductCouponsPage() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [productType, setProductType] = useState<ProductType | ''>('');
  const [isActive, setIsActive] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const [editing, setEditing] = useState<ProductCoupon | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ProductCoupon | null>(null);

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.list({ page: 1, limit: 200 }),
  });

  const couponsQuery = useQuery({
    queryKey: ['productCoupons', productId, productType, isActive, debouncedSearch],
    queryFn: () =>
      productCouponsService.list({
        productId: productId ? Number(productId) : undefined,
        productType: productType || undefined,
        isActive: isActive !== '' ? Number(isActive) : undefined,
        search: debouncedSearch || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productCouponsService.remove(id),
    onSuccess: () => {
      toast.success('Coupon deleted.');
      queryClient.invalidateQueries({ queryKey: ['productCoupons'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<ProductCoupon>[] = [
    { key: 'product', label: 'Product', render: (c) => c.product?.name ?? `#${c.productId}` },
    {
      key: 'code',
      label: 'Code',
      render: (c) => (
        <div>
          <div className={styles.code}>{c.code}</div>
          <div className={styles.hint}>{c.name}</div>
        </div>
      ),
    },
    { key: 'productType', label: 'Type', render: (c) => PRODUCT_TYPE_LABELS[c.productType] },
    {
      key: 'discount',
      label: 'Discount',
      render: (c) => (c.discountType === 'PERCENTAGE' ? `${c.percentage}%` : formatCurrency(c.amount)),
    },
    { key: 'usageLimit', label: 'Usage Limit', render: (c) => (c.usageLimit ?? 'Unlimited') },
    { key: 'endAt', label: 'Expires', render: (c) => (c.endAt ? formatDateTime(c.endAt) : 'No expiry') },
    {
      key: 'isActive',
      label: 'Status',
      render: (c) => <StatusBadge label={c.isActive ? 'Active' : 'Inactive'} tone={statusToneFromFlag(c.isActive)} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (c) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(c)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Product Coupons"
        description="Code-based discounts buyers apply themselves at checkout, configured per product and buyer type."
        actions={<Button onClick={() => setEditing(null)}>Add Coupon</Button>}
      />

      <div className={styles.filters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or code…" />
        <div className={styles.filterSelect}>
          <Select
            placeholder="All products"
            options={(productsQuery.data?.items ?? []).map((p) => ({ value: String(p.id), label: p.name }))}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All types"
            options={PRODUCT_TYPES.map((t) => ({ value: t, label: PRODUCT_TYPE_LABELS[t] }))}
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType | '')}
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All statuses"
            options={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ]}
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={couponsQuery.data ?? []}
        rowKey={(c) => c.id}
        loading={couponsQuery.isLoading}
        error={couponsQuery.isError ? toApiError(couponsQuery.error).message : null}
        emptyMessage="No coupons found"
      />

      <ProductCouponFormModal
        open={editing !== undefined}
        coupon={editing ?? null}
        defaultProductId={productId ? Number(productId) : undefined}
        onClose={() => setEditing(undefined)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Coupon"
        message="This will permanently delete this coupon."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

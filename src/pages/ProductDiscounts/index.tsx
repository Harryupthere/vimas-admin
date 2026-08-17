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
import { productDiscountsService } from '../../services/productDiscounts.service';
import { productsService } from '../../services/products.service';
import type { ProductDiscount } from '../../types/productDiscount.types';
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPES, type ProductType } from '../../types/productType.types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ProductDiscountFormModal } from './ProductDiscountFormModal';
import styles from './ProductDiscounts.module.scss';

export default function ProductDiscountsPage() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [productType, setProductType] = useState<ProductType | ''>('');
  const [isActive, setIsActive] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const [editing, setEditing] = useState<ProductDiscount | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ProductDiscount | null>(null);

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.list({ page: 1, limit: 200 }),
  });

  const discountsQuery = useQuery({
    queryKey: ['productDiscounts', productId, productType, isActive, debouncedSearch],
    queryFn: () =>
      productDiscountsService.list({
        productId: productId ? Number(productId) : undefined,
        productType: productType || undefined,
        isActive: isActive !== '' ? Number(isActive) : undefined,
        search: debouncedSearch || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productDiscountsService.remove(id),
    onSuccess: () => {
      toast.success('Discount deleted.');
      queryClient.invalidateQueries({ queryKey: ['productDiscounts'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<ProductDiscount>[] = [
    { key: 'product', label: 'Product', render: (d) => d.product?.name ?? `#${d.productId}` },
    { key: 'name', label: 'Name', render: (d) => d.name },
    { key: 'productType', label: 'Type', render: (d) => PRODUCT_TYPE_LABELS[d.productType] },
    {
      key: 'discount',
      label: 'Discount',
      render: (d) => (d.discountType === 'PERCENTAGE' ? `${d.percentage}%` : formatCurrency(d.amount)),
    },
    { key: 'minimumQuantity', label: 'Min Qty', render: (d) => (d.minimumQuantity ?? '—') },
    { key: 'endAt', label: 'Expires', render: (d) => (d.endAt ? formatDateTime(d.endAt) : 'No expiry') },
    {
      key: 'isActive',
      label: 'Status',
      render: (d) => <StatusBadge label={d.isActive ? 'Active' : 'Inactive'} tone={statusToneFromFlag(d.isActive)} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (d) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(d)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(d)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Product Discounts"
        description="Automatic discounts applied at checkout without a code, configured per product and buyer type."
        actions={<Button onClick={() => setEditing(null)}>Add Discount</Button>}
      />

      <div className={styles.filters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name…" />
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
        data={discountsQuery.data ?? []}
        rowKey={(d) => d.id}
        loading={discountsQuery.isLoading}
        error={discountsQuery.isError ? toApiError(discountsQuery.error).message : null}
        emptyMessage="No discounts found"
      />

      <ProductDiscountFormModal
        open={editing !== undefined}
        discount={editing ?? null}
        defaultProductId={productId ? Number(productId) : undefined}
        onClose={() => setEditing(undefined)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Discount"
        message="This will permanently delete this discount."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

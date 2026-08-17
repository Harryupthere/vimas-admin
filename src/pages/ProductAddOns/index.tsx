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
import { productAddOnsService } from '../../services/productAddOns.service';
import { productsService } from '../../services/products.service';
import type { ProductAddOn } from '../../types/productAddOn.types';
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPES, type ProductType } from '../../types/productType.types';
import { formatCurrency } from '../../utils/formatters';
import { ProductAddOnFormModal } from './ProductAddOnFormModal';
import styles from './ProductAddOns.module.scss';

export default function ProductAddOnsPage() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [productType, setProductType] = useState<ProductType | ''>('');
  const [isActive, setIsActive] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const [editing, setEditing] = useState<ProductAddOn | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ProductAddOn | null>(null);

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.list({ page: 1, limit: 200 }),
  });

  const addOnsQuery = useQuery({
    queryKey: ['productAddOns', productId, productType, isActive, debouncedSearch],
    queryFn: () =>
      productAddOnsService.list({
        productId: productId ? Number(productId) : undefined,
        productType: productType || undefined,
        isActive: isActive !== '' ? Number(isActive) : undefined,
        search: debouncedSearch || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productAddOnsService.remove(id),
    onSuccess: () => {
      toast.success('Add-on deleted.');
      queryClient.invalidateQueries({ queryKey: ['productAddOns'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<ProductAddOn>[] = [
    { key: 'product', label: 'Product', render: (a) => a.product?.name ?? `#${a.productId}` },
    {
      key: 'name',
      label: 'Name',
      render: (a) => (
        <div>
          <div>{a.name}</div>
          {a.symbol && <div className={styles.hint}>{a.symbol}</div>}
        </div>
      ),
    },
    { key: 'productType', label: 'Type', render: (a) => PRODUCT_TYPE_LABELS[a.productType] },
    {
      key: 'price',
      label: 'Price',
      render: (a) => (a.calculationType === 'PERCENTAGE' ? `${a.percentage}%` : formatCurrency(a.amount)),
    },
    { key: 'costPerUnit', label: 'Per Unit', render: (a) => (a.costPerUnit ? 'Yes' : 'No') },
    {
      key: 'isActive',
      label: 'Status',
      render: (a) => <StatusBadge label={a.isActive ? 'Active' : 'Inactive'} tone={statusToneFromFlag(a.isActive)} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (a) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(a)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(a)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Product Add-Ons"
        description="Optional extras (gift wrapping, warranty…) buyers can opt into, configured per product and buyer type."
        actions={<Button onClick={() => setEditing(null)}>Add Add-On</Button>}
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
        data={addOnsQuery.data ?? []}
        rowKey={(a) => a.id}
        loading={addOnsQuery.isLoading}
        error={addOnsQuery.isError ? toApiError(addOnsQuery.error).message : null}
        emptyMessage="No add-ons found"
      />

      <ProductAddOnFormModal
        open={editing !== undefined}
        addOn={editing ?? null}
        defaultProductId={productId ? Number(productId) : undefined}
        onClose={() => setEditing(undefined)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Add-On"
        message="This will permanently delete this add-on."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

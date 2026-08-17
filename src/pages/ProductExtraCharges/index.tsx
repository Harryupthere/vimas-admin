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
import { productExtraChargesService } from '../../services/productExtraCharges.service';
import { productsService } from '../../services/products.service';
import type { ProductExtraCharge } from '../../types/productExtraCharge.types';
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPES, type ProductType } from '../../types/productType.types';
import { formatCurrency } from '../../utils/formatters';
import { ProductExtraChargeFormModal } from './ProductExtraChargeFormModal';
import styles from './ProductExtraCharges.module.scss';

export default function ProductExtraChargesPage() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [productType, setProductType] = useState<ProductType | ''>('');
  const [isActive, setIsActive] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const [editing, setEditing] = useState<ProductExtraCharge | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ProductExtraCharge | null>(null);

  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.list({ page: 1, limit: 200 }),
  });

  const chargesQuery = useQuery({
    queryKey: ['productExtraCharges', productId, productType, isActive, debouncedSearch],
    queryFn: () =>
      productExtraChargesService.list({
        productId: productId ? Number(productId) : undefined,
        productType: productType || undefined,
        isActive: isActive !== '' ? Number(isActive) : undefined,
        search: debouncedSearch || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productExtraChargesService.remove(id),
    onSuccess: () => {
      toast.success('Extra charge deleted.');
      queryClient.invalidateQueries({ queryKey: ['productExtraCharges'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<ProductExtraCharge>[] = [
    { key: 'product', label: 'Product', render: (c) => c.product?.name ?? `#${c.productId}` },
    { key: 'name', label: 'Name', render: (c) => (
        <div>
          <div>{c.name}</div>
          {c.symbol && <div className={styles.hint}>{c.symbol}</div>}
        </div>
      ) },
    { key: 'productType', label: 'Type', render: (c) => PRODUCT_TYPE_LABELS[c.productType] },
    {
      key: 'charge',
      label: 'Charge',
      render: (c) => (c.calculationType === 'PERCENTAGE' ? `${c.percentage}%` : formatCurrency(c.amount)),
    },
    {
      key: 'fixedAmount',
      label: 'Fixed Fee',
      render: (c) => (c.fixedAmount ? `${formatCurrency(c.fixedAmount)} / ${c.fixedAmountBasis?.toLowerCase() ?? c.calculationBasis.toLowerCase()}` : '—'),
    },
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
        title="Product Extra Charges"
        description="Additional fees (processing, platform, shipping…) admins configure per product and buyer type."
        actions={<Button onClick={() => setEditing(null)}>Add Extra Charge</Button>}
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
        data={chargesQuery.data ?? []}
        rowKey={(c) => c.id}
        loading={chargesQuery.isLoading}
        error={chargesQuery.isError ? toApiError(chargesQuery.error).message : null}
        emptyMessage="No extra charges found"
      />

      <ProductExtraChargeFormModal
        open={editing !== undefined}
        charge={editing ?? null}
        defaultProductId={productId ? Number(productId) : undefined}
        onClose={() => setEditing(undefined)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Extra Charge"
        message="This will permanently delete this extra charge."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

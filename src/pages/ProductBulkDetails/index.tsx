import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Select } from '../../components/Select';
import { StatusBadge, statusToneFromFlag } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { toApiError } from '../../services/api';
import { productBulkDetailsService } from '../../services/productBulkDetails.service';
import type { ProductBulkDetail } from '../../types/productBulkDetail.types';
import { formatCurrency } from '../../utils/formatters';
import { ProductBulkDetailFormModal } from './ProductBulkDetailFormModal';
import styles from './ProductBulkDetails.module.scss';

export default function ProductBulkDetailsPage() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [status, setStatus] = useState('');
  const debouncedProductId = useDebouncedValue(productId);

  const [editing, setEditing] = useState<ProductBulkDetail | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ProductBulkDetail | null>(null);

  const detailsQuery = useQuery({
    queryKey: ['productBulkDetails', debouncedProductId, status],
    queryFn: () =>
      productBulkDetailsService.list({
        productId: debouncedProductId ? Number(debouncedProductId) : undefined,
        status: status !== '' ? Number(status) : undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productBulkDetailsService.remove(id),
    onSuccess: () => {
      toast.success('Bulk pricing tier deleted.');
      queryClient.invalidateQueries({ queryKey: ['productBulkDetails'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<ProductBulkDetail>[] = [
    { key: 'productId', label: 'Product', render: (d) => d.product?.name ?? `#${d.productId}` },
    { key: 'packageQuantity', label: 'Package Qty', render: (d) => String(d.packageQuantity) },
    { key: 'unitPrice', label: 'Unit Price', render: (d) => formatCurrency(d.unitPrice) },
    { key: 'discountPercentage', label: 'Discount', render: (d) => `${d.discountPercentage}%` },
    { key: 'freeQuantity', label: 'Free Qty', render: (d) => String(d.freeQuantity) },
    { key: 'totalPrice', label: 'Total Price', render: (d) => formatCurrency(d.totalPrice) },
    { key: 'totalPoints', label: 'Total Points', render: (d) => String(d.totalPoints) },
    {
      key: 'status',
      label: 'Status',
      render: (d) => <StatusBadge label={d.status ? 'Active' : 'Inactive'} tone={statusToneFromFlag(d.status)} />,
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
        title="Product Bulk Details"
        description="Bulk/package pricing tiers buyers can choose (e.g. buy 10 units at a discounted unit price)."
        actions={<Button onClick={() => setEditing(null)}>Add Bulk Pricing Tier</Button>}
      />

      <div className={styles.filters}>
        <div className={styles.filterInput}>
          <Input
            placeholder="Filter by product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value.replace(/\D/g, ''))}
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All statuses"
            options={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={detailsQuery.data ?? []}
        rowKey={(d) => d.id}
        loading={detailsQuery.isLoading}
        error={detailsQuery.isError ? toApiError(detailsQuery.error).message : null}
        emptyMessage="No bulk pricing tiers found"
      />

      <ProductBulkDetailFormModal
        open={editing !== undefined}
        detail={editing ?? null}
        defaultProductId={debouncedProductId ? Number(debouncedProductId) : undefined}
        onClose={() => setEditing(undefined)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Bulk Pricing Tier"
        message="This will permanently delete this pricing tier."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

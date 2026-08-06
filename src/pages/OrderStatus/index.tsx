import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { orderStatusService } from '../../services/orderStatus.service';
import type { OrderStatus } from '../../types/orderStatus.types';
import { formatDate } from '../../utils/formatters';
import { OrderStatusFormModal } from './OrderStatusFormModal';
import styles from './OrderStatus.module.scss';

export default function OrderStatusPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<OrderStatus | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<OrderStatus | null>(null);

  const statusesQuery = useQuery({
    queryKey: ['orderStatus'],
    queryFn: () => orderStatusService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => orderStatusService.remove(id),
    onSuccess: () => {
      toast.success('Order status deleted.');
      queryClient.invalidateQueries({ queryKey: ['orderStatus'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<OrderStatus>[] = [
    { key: 'id', label: 'ID', width: '80px', render: (s) => `#${s.id}` },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', render: (s) => s.description ?? '—' },
    { key: 'createdAt', label: 'Created', render: (s) => formatDate(s.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (s) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(s)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(s)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Order Status"
        description="Manage the order lifecycle stages orders move through."
        actions={<Button onClick={() => setEditing(null)}>Add Status</Button>}
      />

      <Table
        columns={columns}
        data={statusesQuery.data ?? []}
        rowKey={(s) => s.id}
        loading={statusesQuery.isLoading}
        error={statusesQuery.isError ? toApiError(statusesQuery.error).message : null}
        emptyMessage="No order statuses found"
      />

      <OrderStatusFormModal open={editing !== undefined} status={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Order Status"
        message={`Delete "${deleting?.name}"? This fails if any orders currently use this status.`}
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

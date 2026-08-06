import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { paymentStatusService } from '../../services/paymentStatus.service';
import type { PaymentStatus } from '../../types/paymentStatus.types';
import { formatDate } from '../../utils/formatters';
import { PaymentStatusFormModal } from './PaymentStatusFormModal';
import styles from './PaymentStatus.module.scss';

export default function PaymentStatusPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<PaymentStatus | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<PaymentStatus | null>(null);

  const statusesQuery = useQuery({
    queryKey: ['paymentStatus'],
    queryFn: () => paymentStatusService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentStatusService.remove(id),
    onSuccess: () => {
      toast.success('Payment status deleted.');
      queryClient.invalidateQueries({ queryKey: ['paymentStatus'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<PaymentStatus>[] = [
    { key: 'id', label: 'ID', width: '80px', render: (s) => `#${s.id}` },
    {
      key: 'name',
      label: 'Name',
      render: (s) => (
        <span className={styles.nameCell}>
          <span className={styles.colourDot} style={{ background: s.colour || 'var(--gray-300)' }} />
          {s.name}
        </span>
      ),
    },
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
        title="Payment Status"
        description="Manage payment states used across orders."
        actions={<Button onClick={() => setEditing(null)}>Add Status</Button>}
      />

      <Table
        columns={columns}
        data={statusesQuery.data ?? []}
        rowKey={(s) => s.id}
        loading={statusesQuery.isLoading}
        error={statusesQuery.isError ? toApiError(statusesQuery.error).message : null}
        emptyMessage="No payment statuses found"
      />

      <PaymentStatusFormModal open={editing !== undefined} status={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Payment Status"
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

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { paymentOptionsService } from '../../services/paymentOptions.service';
import type { PaymentOption } from '../../types/paymentOption.types';
import { formatCurrency } from '../../utils/formatters';
import { PaymentOptionFormModal } from './PaymentOptionFormModal';
import styles from './PaymentOptions.module.scss';

export default function PaymentOptionsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<PaymentOption | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<PaymentOption | null>(null);

  const optionsQuery = useQuery({
    queryKey: ['paymentOptions'],
    queryFn: () => paymentOptionsService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentOptionsService.remove(id),
    onSuccess: () => {
      toast.success('Payment option deleted.');
      queryClient.invalidateQueries({ queryKey: ['paymentOptions'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<PaymentOption>[] = [
    { key: 'id', label: 'ID', width: '80px', render: (o) => `#${o.id}` },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', render: (o) => o.description ?? '—' },
    { key: 'charges', label: 'Charges', render: (o) => formatCurrency(o.charges) },
    {
      key: 'note',
      label: 'Notes',
      render: (o) =>
        o.note && o.note.length > 0 ? (
          <ul className={styles.noteList}>
            {o.note.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        ) : (
          '—'
        ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (o) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(o)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(o)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Options"
        description="Manage the payment methods buyers can choose at checkout."
        actions={<Button onClick={() => setEditing(null)}>Add Payment Option</Button>}
      />

      <Table
        columns={columns}
        data={optionsQuery.data ?? []}
        rowKey={(o) => o.id}
        loading={optionsQuery.isLoading}
        error={optionsQuery.isError ? toApiError(optionsQuery.error).message : null}
        emptyMessage="No payment options found"
      />

      <PaymentOptionFormModal open={editing !== undefined} option={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Payment Option"
        message={`Delete "${deleting?.name}"?`}
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

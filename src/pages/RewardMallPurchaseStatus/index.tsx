import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { rewardMallPurchaseStatusService } from '../../services/rewardMallPurchaseStatus.service';
import type { RewardMallPurchaseStatus } from '../../types/rewardMallPurchaseStatus.types';
import { RewardMallPurchaseStatusFormModal } from './RewardMallPurchaseStatusFormModal';
import styles from './RewardMallPurchaseStatus.module.scss';

export default function RewardMallPurchaseStatusPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<RewardMallPurchaseStatus | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<RewardMallPurchaseStatus | null>(null);

  const statusesQuery = useQuery({
    queryKey: ['rewardMallPurchaseStatus'],
    queryFn: () => rewardMallPurchaseStatusService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rewardMallPurchaseStatusService.remove(id),
    onSuccess: () => {
      toast.success('Status deleted.');
      queryClient.invalidateQueries({ queryKey: ['rewardMallPurchaseStatus'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<RewardMallPurchaseStatus>[] = [
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
    { key: 'symbol', label: 'Symbol', render: (s) => s.symbol ?? '—' },
    { key: 'description', label: 'Description', render: (s) => s.description ?? '—' },
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
        title="Reward Mall Purchase Status"
        description="Fulfilment states a redeemed reward moves through (pending, shipped, delivered...)."
        actions={<Button onClick={() => setEditing(null)}>Add Status</Button>}
      />

      <Table
        columns={columns}
        data={statusesQuery.data ?? []}
        rowKey={(s) => s.id}
        loading={statusesQuery.isLoading}
        error={statusesQuery.isError ? toApiError(statusesQuery.error).message : null}
        emptyMessage="No purchase statuses found"
      />

      <RewardMallPurchaseStatusFormModal open={editing !== undefined} status={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Purchase Status"
        message={`Delete "${deleting?.name}"? This fails if any reward mall purchases currently use it.`}
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

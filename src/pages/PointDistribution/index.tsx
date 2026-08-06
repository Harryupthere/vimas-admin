import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Select } from '../../components/Select';
import { StatusBadge, statusToneFromFlag } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { pointDistributionService } from '../../services/pointDistribution.service';
import type { PointDistribution, PointDistributionStatus } from '../../types/pointDistribution.types';
import { PointDistributionFormModal } from './PointDistributionFormModal';
import styles from './PointDistribution.module.scss';

export default function PointDistributionPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PointDistributionStatus | ''>('');
  const [editing, setEditing] = useState<PointDistribution | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<PointDistribution | null>(null);

  const rulesQuery = useQuery({
    queryKey: ['pointDistribution', status],
    queryFn: () => pointDistributionService.list(status || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pointDistributionService.remove(id),
    onSuccess: () => {
      toast.success('Rule deleted.');
      queryClient.invalidateQueries({ queryKey: ['pointDistribution'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<PointDistribution>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (r) => (
        <span className={styles.nameCell}>
          {r.colour && <span className={styles.colourDot} style={{ background: r.colour }} />}
          {r.name}
        </span>
      ),
    },
    { key: 'eventType', label: 'Event' },
    { key: 'receiverType', label: 'Receiver' },
    { key: 'pointsPercentage', label: 'Share', render: (r) => `${r.pointsPercentage}%` },
    { key: 'priority', label: 'Priority', render: (r) => String(r.priority) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge label={r.status === 'active' ? 'Active' : 'Inactive'} tone={statusToneFromFlag(r.status === 'active')} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(r)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Point Distribution"
        description="Rules that decide how a product's points are split across buyer, upline, and pool."
        actions={<Button onClick={() => setEditing(null)}>Add Rule</Button>}
      />

      <div className={styles.filters}>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All statuses"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value as PointDistributionStatus | '')}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={rulesQuery.data ?? []}
        rowKey={(r) => r.id}
        loading={rulesQuery.isLoading}
        error={rulesQuery.isError ? toApiError(rulesQuery.error).message : null}
        emptyMessage="No distribution rules found"
      />

      <PointDistributionFormModal open={editing !== undefined} rule={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Distribution Rule"
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

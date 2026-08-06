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
import { pointPoolDetailService } from '../../services/pointPoolDetail.service';
import type { PointPoolDetail, PointPoolDetailStatus } from '../../types/pointPoolDetail.types';
import { PointPoolDetailFormModal } from './PointPoolDetailFormModal';
import styles from './PointPoolDetails.module.scss';

export default function PointPoolDetailsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PointPoolDetailStatus | ''>('');
  const [editing, setEditing] = useState<PointPoolDetail | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<PointPoolDetail | null>(null);

  const detailsQuery = useQuery({
    queryKey: ['pointPoolDetail', status],
    queryFn: () => pointPoolDetailService.list(status || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pointPoolDetailService.remove(id),
    onSuccess: () => {
      toast.success('Pool detail deleted.');
      queryClient.invalidateQueries({ queryKey: ['pointPoolDetail'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<PointPoolDetail>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (d) => (
        <span className={styles.nameCell}>
          {d.colour && <span className={styles.colourDot} style={{ background: d.colour }} />}
          {d.name}
        </span>
      ),
    },
    { key: 'type', label: 'Recurrence', render: (d) => d.type.replace('_', '-') },
    { key: 'description', label: 'Description', render: (d) => d.description ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (d) => <StatusBadge label={d.status === 'active' ? 'Active' : 'Inactive'} tone={statusToneFromFlag(d.status === 'active')} />,
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
        title="Point Pool Details"
        description="Recurring pool templates (hourly, weekly, monthly...) that scheduled pools are created from."
        actions={<Button onClick={() => setEditing(null)}>Add Pool Detail</Button>}
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
            onChange={(e) => setStatus(e.target.value as PointPoolDetailStatus | '')}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={detailsQuery.data ?? []}
        rowKey={(d) => d.id}
        loading={detailsQuery.isLoading}
        error={detailsQuery.isError ? toApiError(detailsQuery.error).message : null}
        emptyMessage="No pool details found"
      />

      <PointPoolDetailFormModal open={editing !== undefined} detail={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Pool Detail"
        message={`Delete "${deleting?.name}"? This fails if any pools currently use this detail.`}
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

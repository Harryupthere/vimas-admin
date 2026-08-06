import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Select } from '../../components/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { pointPoolService } from '../../services/pointPool.service';
import { POINT_POOL_STATUSES, type PointPool, type PointPoolStatus } from '../../types/pointPool.types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { PointPoolFormModal } from './PointPoolFormModal';
import styles from './PointPools.module.scss';

const LIMIT = 10;

const STATUS_TONE: Record<PointPoolStatus, 'success' | 'neutral' | 'info' | 'danger'> = {
  active: 'success',
  inactive: 'neutral',
  completed: 'info',
  cancelled: 'danger',
};

export default function PointPoolsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PointPoolStatus | ''>('');
  const [editing, setEditing] = useState<PointPool | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<PointPool | null>(null);

  const poolsQuery = useQuery({
    queryKey: ['pointPools', page, LIMIT, status],
    queryFn: () => pointPoolService.list({ page, limit: LIMIT, status: status || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pointPoolService.remove(id),
    onSuccess: () => {
      toast.success('Pool deleted.');
      queryClient.invalidateQueries({ queryKey: ['pointPools'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<PointPool>[] = [
    { key: 'poolDetail', label: 'Pool', render: (p) => p.poolDetail?.name ?? `#${p.poolDetailId}` },
    { key: 'fromDatetime', label: 'From', render: (p) => formatDateTime(p.fromDatetime) },
    { key: 'toDatetime', label: 'To', render: (p) => formatDateTime(p.toDatetime) },
    { key: 'totalUsers', label: 'Users', render: (p) => String(p.totalUsers) },
    { key: 'currentBalance', label: 'Balance', render: (p) => formatCurrency(p.currentBalance) },
    { key: 'distributedPoints', label: 'Distributed', render: (p) => formatCurrency(p.distributedPoints) },
    {
      key: 'status',
      label: 'Status',
      render: (p) => <StatusBadge label={p.status} tone={STATUS_TONE[p.status]} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (p) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(p)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Point Pools"
        description="Scheduled pool instances created from a recurring pool detail template."
        actions={<Button onClick={() => setEditing(null)}>Add Pool</Button>}
      />

      <div className={styles.filters}>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All statuses"
            options={POINT_POOL_STATUSES.map((s) => ({ value: s, label: s }))}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as PointPoolStatus | '');
              setPage(1);
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={poolsQuery.data?.items ?? []}
        rowKey={(p) => p.id}
        loading={poolsQuery.isLoading}
        error={poolsQuery.isError ? toApiError(poolsQuery.error).message : null}
        emptyMessage="No pools found"
      />

      {poolsQuery.data && (
        <Pagination
          page={poolsQuery.data.page}
          totalPages={poolsQuery.data.totalPages}
          total={poolsQuery.data.total}
          limit={poolsQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <PointPoolFormModal open={editing !== undefined} pool={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Pool"
        message="This will permanently delete this pool instance."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

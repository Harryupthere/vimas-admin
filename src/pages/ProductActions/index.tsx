import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Select } from '../../components/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { productActionsService } from '../../services/productActions.service';
import type { ProductAction } from '../../types/productAction.types';
import { formatDateTime } from '../../utils/formatters';
import { RemarkModal } from './RemarkModal';
import styles from './ProductActions.module.scss';

const STAGE_LABELS: Record<number, string> = { 0: 'Listing', 1: 'Update' };
const ATTEMPT_LABELS: Record<number, string> = { 0: 'New', 1: 'Reattempt' };

type PendingReview = { type: 'approve' | 'reject'; action: ProductAction };

export default function ProductActionsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [stage, setStage] = useState('');
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(null);
  const [deleteAction, setDeleteAction] = useState<ProductAction | null>(null);

  const actionsQuery = useQuery({
    queryKey: ['productActions', status, stage],
    queryFn: () =>
      productActionsService.list({
        status: status ? Number(status) : undefined,
        stage: stage ? Number(stage) : undefined,
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['productActions'] });

  const reviewMutation = useMutation({
    mutationFn: ({ id, remark }: { id: number; remark: string }) =>
      productActionsService.update(id, {
        currentStatus: pendingReview?.type === 'approve' ? 1 : 0,
        adminRemarks: remark.trim() ? [remark.trim()] : undefined,
      }),
    onSuccess: () => {
      toast.success(pendingReview?.type === 'approve' ? 'Product approved.' : 'Product rejected.');
      invalidate();
      setPendingReview(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productActionsService.remove(id),
    onSuccess: () => {
      toast.success('Action removed.');
      invalidate();
      setDeleteAction(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<ProductAction>[] = [
    { key: 'product', label: 'Product', render: (a) => a.product?.name ?? `Product #${a.productId}` },
    { key: 'stage', label: 'Stage', render: (a) => STAGE_LABELS[a.currentStage] ?? a.currentStage },
    {
      key: 'status',
      label: 'Status',
      render: (a) => <StatusBadge label={a.currentStatus ? 'Active' : 'Pending'} tone={a.currentStatus ? 'success' : 'warning'} />,
    },
    { key: 'attempt', label: 'Attempt', render: (a) => ATTEMPT_LABELS[a.attemptType] ?? a.attemptType },
    {
      key: 'merchantRemarks',
      label: 'Merchant Remark',
      render: (a) => <span className={styles.remark}>{a.merchantRemarks?.at(-1) ?? '—'}</span>,
    },
    {
      key: 'adminRemarks',
      label: 'Admin Remark',
      render: (a) => <span className={styles.remark}>{a.adminRemarks?.at(-1) ?? '—'}</span>,
    },
    { key: 'createdAt', label: 'Submitted', render: (a) => formatDateTime(a.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (a) => (
        <div className={styles.actions}>
          <Button variant="outline" size="sm" onClick={() => setPendingReview({ type: 'approve', action: a })}>
            Approve
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPendingReview({ type: 'reject', action: a })}>
            Reject
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteAction(a)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Product Actions" description="Review merchant listing and update submissions." />

      <div className={styles.filters}>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All statuses"
            options={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Pending' },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All stages"
            options={[
              { value: '0', label: 'Listing' },
              { value: '1', label: 'Update' },
            ]}
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={actionsQuery.data ?? []}
        rowKey={(a) => a.id}
        loading={actionsQuery.isLoading}
        error={actionsQuery.isError ? toApiError(actionsQuery.error).message : null}
        emptyMessage="No product actions found"
      />

      <RemarkModal
        open={pendingReview !== null}
        title={pendingReview?.type === 'approve' ? 'Approve Product' : 'Reject Product'}
        danger={pendingReview?.type === 'reject'}
        loading={reviewMutation.isPending}
        onCancel={() => setPendingReview(null)}
        onConfirm={(remark) => reviewMutation.mutate({ id: pendingReview!.action.id, remark })}
      />

      <ConfirmDialog
        open={deleteAction !== null}
        title="Delete Action"
        message="This will permanently remove this submission record."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteAction!.id)}
        onCancel={() => setDeleteAction(null)}
      />
    </div>
  );
}

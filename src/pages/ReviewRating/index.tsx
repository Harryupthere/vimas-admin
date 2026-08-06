import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { StatusBadge, statusToneFromFlag } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { reviewRatingService } from '../../services/reviewRating.service';
import type { ReviewRating } from '../../types/reviewRating.types';
import { formatDateTime } from '../../utils/formatters';
import styles from './ReviewRating.module.scss';

const LIMIT = 10;

type PendingAction = { type: 'toggle' | 'delete'; review: ReviewRating };

export default function ReviewRatingPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const reviewsQuery = useQuery({
    queryKey: ['reviewRating', page, LIMIT],
    queryFn: () => reviewRatingService.list({ page, limit: LIMIT }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['reviewRating'] });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, showStatus }: { id: number; showStatus: number }) =>
      reviewRatingService.setVisibility(id, { showStatus }),
    onSuccess: () => {
      toast.success('Visibility updated.');
      invalidate();
      setPendingAction(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => reviewRatingService.remove(id),
    onSuccess: () => {
      toast.success('Review deleted.');
      invalidate();
      setPendingAction(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<ReviewRating>[] = [
    { key: 'product', label: 'Product', render: (r) => r.product?.name ?? `#${r.productId}` },
    { key: 'user', label: 'User', render: (r) => r.user?.username ?? r.user?.email ?? `User #${r.userId}` },
    { key: 'rate', label: 'Rating', render: (r) => <span className={styles.stars}>{'★'.repeat(r.rate)}</span> },
    { key: 'review', label: 'Review', render: (r) => <span className={styles.review}>{r.review ?? '—'}</span> },
    {
      key: 'showStatus',
      label: 'Visible',
      render: (r) => <StatusBadge label={r.showStatus ? 'Visible' : 'Hidden'} tone={statusToneFromFlag(r.showStatus)} />,
    },
    { key: 'createdAt', label: 'Posted', render: (r) => formatDateTime(r.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <Button variant="outline" size="sm" onClick={() => setPendingAction({ type: 'toggle', review: r })}>
            {r.showStatus ? 'Hide' : 'Show'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPendingAction({ type: 'delete', review: r })}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleConfirm = () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'delete') {
      deleteMutation.mutate(pendingAction.review.id);
    } else {
      visibilityMutation.mutate({ id: pendingAction.review.id, showStatus: pendingAction.review.showStatus ? 0 : 1 });
    }
  };

  return (
    <div>
      <PageHeader title="Review & Rating" description="Moderate buyer product reviews." />

      <Table
        columns={columns}
        data={reviewsQuery.data?.items ?? []}
        rowKey={(r) => r.id}
        loading={reviewsQuery.isLoading}
        error={reviewsQuery.isError ? toApiError(reviewsQuery.error).message : null}
        emptyMessage="No reviews found"
      />

      {reviewsQuery.data && (
        <Pagination
          page={reviewsQuery.data.page}
          totalPages={reviewsQuery.data.totalPages}
          total={reviewsQuery.data.total}
          limit={reviewsQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.type === 'delete' ? 'Delete Review' : pendingAction?.review.showStatus ? 'Hide Review' : 'Show Review'}
        message={
          pendingAction?.type === 'delete'
            ? 'This will permanently delete this review. This cannot be undone.'
            : pendingAction?.review.showStatus
              ? 'This review will no longer be visible to buyers.'
              : 'This review will become visible to buyers.'
        }
        confirmLabel={pendingAction?.type === 'delete' ? 'Delete' : 'Confirm'}
        danger={pendingAction?.type === 'delete'}
        loading={visibilityMutation.isPending || deleteMutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

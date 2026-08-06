import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Select } from '../../components/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { toApiError } from '../../services/api';
import { productFeedbackService } from '../../services/productFeedback.service';
import type { ProductFeedback, ProductFeedbackStatus } from '../../types/productFeedback.types';
import { formatDateTime } from '../../utils/formatters';
import styles from './ProductFeedback.module.scss';

const LIMIT = 10;

const STATUS_TONE: Record<ProductFeedbackStatus, 'success' | 'neutral' | 'danger'> = {
  active: 'success',
  hidden: 'neutral',
  deleted: 'danger',
};

export default function ProductFeedbackPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState('');
  const [status, setStatus] = useState('');
  const debouncedProductId = useDebouncedValue(productId);

  const [deleteItem, setDeleteItem] = useState<ProductFeedback | null>(null);

  const feedbackQuery = useQuery({
    queryKey: ['productFeedback', page, LIMIT, debouncedProductId, status],
    queryFn: () =>
      productFeedbackService.list({
        page,
        limit: LIMIT,
        productId: debouncedProductId ? Number(debouncedProductId) : undefined,
        status: (status || undefined) as ProductFeedbackStatus | undefined,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: ProductFeedbackStatus }) =>
      productFeedbackService.setStatus(id, { status: newStatus }),
    onSuccess: () => {
      toast.success('Status updated.');
      queryClient.invalidateQueries({ queryKey: ['productFeedback'] });
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productFeedbackService.remove(id),
    onSuccess: () => {
      toast.success('Feedback deleted.');
      queryClient.invalidateQueries({ queryKey: ['productFeedback'] });
      setDeleteItem(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<ProductFeedback>[] = [
    { key: 'product', label: 'Product', render: (f) => f.product?.name ?? `#${f.productId}` },
    {
      key: 'user',
      label: 'User',
      render: (f) => f.user?.username ?? f.user?.email ?? `User #${f.userId}`,
    },
    {
      key: 'comment',
      label: 'Comment',
      render: (f) => (
        <span className={styles.comment}>
          {f.parentFeedbackId ? '↳ ' : ''}
          {f.comment}
        </span>
      ),
    },
    { key: 'rating', label: 'Rating', render: (f) => (f.rating ? `${f.rating} / 5` : '—') },
    { key: 'likeCount', label: 'Likes', render: (f) => String(f.likeCount) },
    { key: 'replyCount', label: 'Replies', render: (f) => String(f.replyCount) },
    {
      key: 'status',
      label: 'Status',
      render: (f) => <StatusBadge label={f.status} tone={STATUS_TONE[f.status]} />,
    },
    { key: 'createdAt', label: 'Posted', render: (f) => formatDateTime(f.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (f) => (
        <div className={styles.actions}>
          <div className={styles.statusSelect}>
            <Select
              value={f.status}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'hidden', label: 'Hidden' },
                { value: 'deleted', label: 'Deleted' },
              ]}
              onChange={(e) => statusMutation.mutate({ id: f.id, newStatus: e.target.value as ProductFeedbackStatus })}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(f)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Product Feedback" description="Moderate buyer comments and replies on products." />

      <div className={styles.filters}>
        <div className={styles.filterInput}>
          <Input
            placeholder="Filter by product ID"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value.replace(/\D/g, ''));
              setPage(1);
            }}
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All statuses"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'hidden', label: 'Hidden' },
              { value: 'deleted', label: 'Deleted' },
            ]}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={feedbackQuery.data?.items ?? []}
        rowKey={(f) => f.id}
        loading={feedbackQuery.isLoading}
        error={feedbackQuery.isError ? toApiError(feedbackQuery.error).message : null}
        emptyMessage="No feedback found"
      />

      {feedbackQuery.data && (
        <Pagination
          page={feedbackQuery.data.page}
          totalPages={feedbackQuery.data.totalPages}
          total={feedbackQuery.data.total}
          limit={feedbackQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={deleteItem !== null}
        title="Delete Feedback"
        message="This permanently deletes this feedback and cascades to its replies and likes. This cannot be undone."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteItem!.id)}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}

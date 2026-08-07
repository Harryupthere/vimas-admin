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
import { rewardMallCategoriesService } from '../../services/rewardMallCategories.service';
import type { RewardMallCategory } from '../../types/rewardMallCategory.types';
import { RewardMallCategoryFormModal } from './RewardMallCategoryFormModal';
import styles from './RewardMallCategories.module.scss';

export default function RewardMallCategoriesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<RewardMallCategory | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<RewardMallCategory | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['rewardMallCategories', status],
    queryFn: () => rewardMallCategoriesService.list(status ? Number(status) : undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rewardMallCategoriesService.remove(id),
    onSuccess: () => {
      toast.success('Category deleted.');
      queryClient.invalidateQueries({ queryKey: ['rewardMallCategories'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<RewardMallCategory>[] = [
    { key: 'sortOrder', label: '#', width: '50px', render: (c) => String(c.sortOrder) },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', render: (c) => c.description ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (c) => <StatusBadge label={c.status ? 'Active' : 'Inactive'} tone={statusToneFromFlag(c.status)} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (c) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(c)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reward Mall Categories"
        description="Organize reward mall products buyers can redeem with points."
        actions={<Button onClick={() => setEditing(null)}>Add Category</Button>}
      />

      <div className={styles.filters}>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All statuses"
            options={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={categoriesQuery.data ?? []}
        rowKey={(c) => c.id}
        loading={categoriesQuery.isLoading}
        error={categoriesQuery.isError ? toApiError(categoriesQuery.error).message : null}
        emptyMessage="No reward mall categories found"
      />

      <RewardMallCategoryFormModal open={editing !== undefined} category={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Category"
        message={`Delete "${deleting?.name}"? This fails if any reward mall products currently use it.`}
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

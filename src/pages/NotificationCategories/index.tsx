import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { SearchInput } from '../../components/SearchInput';
import { StatusBadge, statusToneFromFlag } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { toApiError } from '../../services/api';
import { notificationCategoriesService } from '../../services/notificationCategories.service';
import type { NotificationCategory } from '../../types/notificationCategory.types';
import { NotificationCategoryFormModal } from './NotificationCategoryFormModal';
import styles from './NotificationCategories.module.scss';

const LIMIT = 10;

export default function NotificationCategoriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [editing, setEditing] = useState<NotificationCategory | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<NotificationCategory | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['notificationCategories', page, LIMIT, debouncedSearch],
    queryFn: () => notificationCategoriesService.list({ page, limit: LIMIT, search: debouncedSearch }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationCategoriesService.remove(id),
    onSuccess: () => {
      toast.success('Category deleted.');
      queryClient.invalidateQueries({ queryKey: ['notificationCategories'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<NotificationCategory>[] = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', render: (c) => c.description ?? '—' },
    {
      key: 'userPreference',
      label: 'User Toggleable',
      render: (c) => <StatusBadge label={c.userPreference ? 'Yes' : 'No'} tone={c.userPreference ? 'info' : 'neutral'} />,
    },
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
        title="Notification Categories"
        description="Buckets notifications are grouped under (e.g. Promotions, Orders, Security)."
        actions={<Button onClick={() => setEditing(null)}>Add Category</Button>}
      />

      <div className={styles.filters}>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search categories…"
        />
      </div>

      <Table
        columns={columns}
        data={categoriesQuery.data?.items ?? []}
        rowKey={(c) => c.id}
        loading={categoriesQuery.isLoading}
        error={categoriesQuery.isError ? toApiError(categoriesQuery.error).message : null}
        emptyMessage="No notification categories found"
      />

      {categoriesQuery.data && (
        <Pagination
          page={categoriesQuery.data.page}
          totalPages={categoriesQuery.data.totalPages}
          total={categoriesQuery.data.total}
          limit={categoriesQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <NotificationCategoryFormModal open={editing !== undefined} category={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Category"
        message={`Delete "${deleting?.name}"? This fails if any notifications currently use it.`}
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

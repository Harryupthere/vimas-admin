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
import { notificationTypesService } from '../../services/notificationTypes.service';
import type { NotificationType } from '../../types/notificationType.types';
import { NotificationTypeFormModal } from './NotificationTypeFormModal';
import styles from './NotificationTypes.module.scss';

const LIMIT = 10;

export default function NotificationTypesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [editing, setEditing] = useState<NotificationType | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<NotificationType | null>(null);

  const typesQuery = useQuery({
    queryKey: ['notificationTypes', page, LIMIT, debouncedSearch],
    queryFn: () => notificationTypesService.list({ page, limit: LIMIT, search: debouncedSearch }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationTypesService.remove(id),
    onSuccess: () => {
      toast.success('Type deleted.');
      queryClient.invalidateQueries({ queryKey: ['notificationTypes'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<NotificationType>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (t) => (
        <span className={styles.nameCell}>
          <span className={styles.colourDots}>
            <span className={styles.colourDot} style={{ background: t.primaryColor || 'var(--gray-300)' }} />
            <span className={styles.colourDot} style={{ background: t.secondaryColor || 'var(--gray-300)' }} />
          </span>
          {t.name}
        </span>
      ),
    },
    { key: 'description', label: 'Description', render: (t) => t.description ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (t) => <StatusBadge label={t.status ? 'Active' : 'Inactive'} tone={statusToneFromFlag(t.status)} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (t) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(t)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(t)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Notification Types"
        description="Visual styles notifications are tagged with (e.g. Info, Warning, Success)."
        actions={<Button onClick={() => setEditing(null)}>Add Type</Button>}
      />

      <div className={styles.filters}>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search types…"
        />
      </div>

      <Table
        columns={columns}
        data={typesQuery.data?.items ?? []}
        rowKey={(t) => t.id}
        loading={typesQuery.isLoading}
        error={typesQuery.isError ? toApiError(typesQuery.error).message : null}
        emptyMessage="No notification types found"
      />

      {typesQuery.data && (
        <Pagination
          page={typesQuery.data.page}
          totalPages={typesQuery.data.totalPages}
          total={typesQuery.data.total}
          limit={typesQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <NotificationTypeFormModal open={editing !== undefined} type={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Type"
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

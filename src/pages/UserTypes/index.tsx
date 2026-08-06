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
import { userTypesService } from '../../services/userTypes.service';
import type { UserType } from '../../types/userType.types';
import { UserTypeFormModal } from './UserTypeFormModal';
import styles from './UserTypes.module.scss';

const LIMIT = 10;

export default function UserTypesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [editing, setEditing] = useState<UserType | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<UserType | null>(null);

  const typesQuery = useQuery({
    queryKey: ['userTypes', page, LIMIT, debouncedSearch],
    queryFn: () => userTypesService.list({ page, limit: LIMIT, search: debouncedSearch }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userTypesService.remove(id),
    onSuccess: () => {
      toast.success('User type deleted.');
      queryClient.invalidateQueries({ queryKey: ['userTypes'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<UserType>[] = [
    { key: 'name', label: 'Name' },
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
        title="User Types"
        description="Buyer account tiers (e.g. regular, merchant)."
        actions={<Button onClick={() => setEditing(null)}>Add User Type</Button>}
      />

      <div className={styles.filters}>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search user types…"
        />
      </div>

      <Table
        columns={columns}
        data={typesQuery.data?.items ?? []}
        rowKey={(t) => t.id}
        loading={typesQuery.isLoading}
        error={typesQuery.isError ? toApiError(typesQuery.error).message : null}
        emptyMessage="No user types found"
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

      <UserTypeFormModal open={editing !== undefined} userType={editing ?? null} onClose={() => setEditing(undefined)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete User Type"
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

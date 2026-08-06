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
import { registrationTypesService } from '../../services/registrationTypes.service';
import type { RegistrationType } from '../../types/registrationType.types';
import { RegistrationTypeFormModal } from './RegistrationTypeFormModal';
import styles from './RegistrationTypes.module.scss';

const LIMIT = 10;

export default function RegistrationTypesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [editing, setEditing] = useState<RegistrationType | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<RegistrationType | null>(null);

  const typesQuery = useQuery({
    queryKey: ['registrationTypes', page, LIMIT, debouncedSearch],
    queryFn: () => registrationTypesService.list({ page, limit: LIMIT, search: debouncedSearch }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => registrationTypesService.remove(id),
    onSuccess: () => {
      toast.success('Registration type deleted.');
      queryClient.invalidateQueries({ queryKey: ['registrationTypes'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<RegistrationType>[] = [
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
        title="Registration Types"
        description="How users can sign up (email, Google, Telegram, username)."
        actions={<Button onClick={() => setEditing(null)}>Add Registration Type</Button>}
      />

      <div className={styles.filters}>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search registration types…"
        />
      </div>

      <Table
        columns={columns}
        data={typesQuery.data?.items ?? []}
        rowKey={(t) => t.id}
        loading={typesQuery.isLoading}
        error={typesQuery.isError ? toApiError(typesQuery.error).message : null}
        emptyMessage="No registration types found"
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

      <RegistrationTypeFormModal
        open={editing !== undefined}
        registrationType={editing ?? null}
        onClose={() => setEditing(undefined)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Registration Type"
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

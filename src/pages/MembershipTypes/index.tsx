import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { SearchInput } from '../../components/SearchInput';
import { Table, type TableColumn } from '../../components/Table';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { toApiError } from '../../services/api';
import { membershipTypesService } from '../../services/membershipTypes.service';
import type { MembershipType } from '../../types/membershipType.types';
import { MembershipTypeFormModal } from './MembershipTypeFormModal';
import styles from './MembershipTypes.module.scss';

const LIMIT = 10;

export default function MembershipTypesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [editing, setEditing] = useState<MembershipType | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<MembershipType | null>(null);

  const typesQuery = useQuery({
    queryKey: ['membershipTypes', page, LIMIT, debouncedSearch],
    queryFn: () => membershipTypesService.list({ page, limit: LIMIT, search: debouncedSearch }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => membershipTypesService.remove(id),
    onSuccess: () => {
      toast.success('Membership type deleted.');
      queryClient.invalidateQueries({ queryKey: ['membershipTypes'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<MembershipType>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (t) => (
        <span className={styles.nameCell}>
          {t.colour && <span className={styles.colourDot} style={{ background: t.colour }} />}
          {t.name}
        </span>
      ),
    },
    { key: 'description', label: 'Description', render: (t) => t.description ?? '—' },
    { key: 'points_required', label: 'Points Required', render: (t) => (t.points_required ?? 0).toString() },
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
        title="Membership Types"
        description="Loyalty tiers users unlock as they accumulate points."
        actions={<Button onClick={() => setEditing(null)}>Add Membership Type</Button>}
      />

      <div className={styles.filters}>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search membership types…"
        />
      </div>

      <Table
        columns={columns}
        data={typesQuery.data?.items ?? []}
        rowKey={(t) => t.id}
        loading={typesQuery.isLoading}
        error={typesQuery.isError ? toApiError(typesQuery.error).message : null}
        emptyMessage="No membership types found"
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

      <MembershipTypeFormModal
        open={editing !== undefined}
        membershipType={editing ?? null}
        onClose={() => setEditing(undefined)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Membership Type"
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

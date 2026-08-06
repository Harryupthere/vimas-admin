import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { SearchInput } from '../../components/SearchInput';
import { Select } from '../../components/Select';
import { StatusBadge, statusToneFromFlag } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { toApiError } from '../../services/api';
import { usersService } from '../../services/users.service';
import { userTypesService } from '../../services/userTypes.service';
import type { User } from '../../types/user.types';
import { formatDate } from '../../utils/formatters';
import { DeleteUserModal } from './DeleteUserModal';
import { UserDetailModal } from './UserDetailModal';
import styles from './Users.module.scss';

const LIMIT = 10;

type StatusAction = { type: 'activate' | 'deactivate' | 'restore'; user: User };

export default function UsersPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [userTypeId, setUserTypeId] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const usersQuery = useQuery({
    queryKey: ['users', page, LIMIT, debouncedSearch, userTypeId],
    queryFn: () => usersService.list({ page, limit: LIMIT, search: debouncedSearch, user_type: userTypeId }),
  });

  const userTypesQuery = useQuery({
    queryKey: ['userTypes', 'all'],
    queryFn: () => userTypesService.list({ page: 1, limit: 100 }),
    staleTime: 5 * 60_000,
  });

  const userTypeOptions = useMemo(
    () => (userTypesQuery.data?.items ?? []).map((ut) => ({ value: String(ut.id), label: ut.name })),
    [userTypesQuery.data],
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof usersService.update>[1] }) =>
      usersService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => {
      toast.error(toApiError(err).message);
    },
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleUserTypeChange = (value: string) => {
    setUserTypeId(value);
    setPage(1);
  };

  const confirmStatusAction = () => {
    if (!statusAction) return;
    const { type, user } = statusAction;
    const payload = type === 'restore' ? { is_admin_deleted: 0 } : { status: type === 'activate' ? 1 : 0 };
    updateMutation.mutate(
      { id: user.id, payload },
      {
        onSuccess: () => {
          toast.success(type === 'restore' ? 'User restored.' : type === 'activate' ? 'User activated.' : 'User deactivated.');
          setStatusAction(null);
        },
      },
    );
  };

  const confirmDelete = (reason: string) => {
    if (!deleteUser) return;
    updateMutation.mutate(
      { id: deleteUser.id, payload: { is_admin_deleted: 1, admin_deleted_reason: reason } },
      {
        onSuccess: () => {
          toast.success('User deleted.');
          setDeleteUser(null);
        },
      },
    );
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'user',
      label: 'User',
      render: (user) => {
        const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
        return (
          <div className={styles.userCell}>
            <span className={styles.userName}>{name || user.username || `User #${user.id}`}</span>
            <span className={styles.userSub}>{user.email || user.phone_number || user.unique_user_id}</span>
          </div>
        );
      },
    },
    {
      key: 'userType',
      label: 'Type',
      render: (user) => user.userType?.name ?? '—',
    },
    {
      key: 'registrationType',
      label: 'Registered Via',
      render: (user) => user.registrationType?.name ?? '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) =>
        user.is_admin_deleted ? (
          <StatusBadge label="Deleted" tone="danger" />
        ) : (
          <StatusBadge label={user.status ? 'Active' : 'Inactive'} tone={statusToneFromFlag(user.status)} />
        ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (user) => formatDate(user.created_at),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (user) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setViewUserId(user.id)}>
            View
          </Button>
          {user.is_admin_deleted ? (
            <Button variant="outline" size="sm" onClick={() => setStatusAction({ type: 'restore', user })}>
              Restore
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusAction({ type: user.status ? 'deactivate' : 'activate', user })}
              >
                {user.status ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteUser(user)}>
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" description="Manage registered buyers and their account status." />

      <div className={styles.filters}>
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search by name, email, phone…" />
        <div className={styles.filterSelect}>
          <Select
            options={userTypeOptions}
            placeholder="All user types"
            value={userTypeId}
            onChange={(e) => handleUserTypeChange(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={usersQuery.data?.items ?? []}
        rowKey={(user) => user.id}
        loading={usersQuery.isLoading}
        error={usersQuery.isError ? toApiError(usersQuery.error).message : null}
        emptyMessage="No users found"
      />

      {usersQuery.data && (
        <Pagination
          page={usersQuery.data.page}
          totalPages={usersQuery.data.totalPages}
          total={usersQuery.data.total}
          limit={usersQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <UserDetailModal userId={viewUserId} onClose={() => setViewUserId(null)} />

      <ConfirmDialog
        open={statusAction !== null}
        title={
          statusAction?.type === 'restore'
            ? 'Restore User'
            : statusAction?.type === 'activate'
              ? 'Activate User'
              : 'Deactivate User'
        }
        message={
          statusAction?.type === 'restore'
            ? 'This will clear the admin-deleted flag and restore the account.'
            : statusAction?.type === 'activate'
              ? 'This user will be able to log in and use their account again.'
              : 'This user will be blocked from logging in until reactivated.'
        }
        confirmLabel={statusAction?.type === 'deactivate' ? 'Deactivate' : 'Confirm'}
        danger={statusAction?.type === 'deactivate'}
        loading={updateMutation.isPending}
        onConfirm={confirmStatusAction}
        onCancel={() => setStatusAction(null)}
      />

      <DeleteUserModal
        open={deleteUser !== null}
        loading={updateMutation.isPending}
        onCancel={() => setDeleteUser(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

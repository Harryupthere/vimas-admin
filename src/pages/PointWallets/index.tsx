import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { pointAdminBalanceService, pointUserBalanceService } from '../../services/pointWallets.service';
import type { PointAdminBalance, PointUserBalance } from '../../types/pointWallet.types';
import { formatCurrency } from '../../utils/formatters';
import { CreateAdminBalanceModal } from './CreateAdminBalanceModal';
import { CreateUserBalanceModal } from './CreateUserBalanceModal';
import { EditBalanceModal } from './EditBalanceModal';
import styles from './PointWallets.module.scss';

const LIMIT = 10;
type Tab = 'user' | 'admin';

export default function PointWalletsPage() {
  const [tab, setTab] = useState<Tab>('user');

  return (
    <div>
      <PageHeader title="Point Wallets" description="Aggregate credit/debit balances per user and per admin." />

      <div className={styles.tabs}>
        <button
          type="button"
          className={[styles.tab, tab === 'user' ? styles.tabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setTab('user')}
        >
          User Balances
        </button>
        <button
          type="button"
          className={[styles.tab, tab === 'admin' ? styles.tabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setTab('admin')}
        >
          Admin Balances
        </button>
      </div>

      {tab === 'user' ? <UserBalancesTab /> : <AdminBalancesTab />}
    </div>
  );
}

function UserBalancesTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PointUserBalance | null>(null);
  const [deleting, setDeleting] = useState<PointUserBalance | null>(null);

  const balancesQuery = useQuery({
    queryKey: ['pointUserBalances', page, LIMIT],
    queryFn: () => pointUserBalanceService.list({ page, limit: LIMIT }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pointUserBalanceService.remove(id),
    onSuccess: () => {
      toast.success('Balance deleted.');
      queryClient.invalidateQueries({ queryKey: ['pointUserBalances'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<PointUserBalance>[] = [
    { key: 'userId', label: 'User', render: (b) => b.user?.username ?? b.user?.email ?? `User #${b.userId}` },
    { key: 'totalCredit', label: 'Total Credit', render: (b) => formatCurrency(b.totalCredit) },
    { key: 'totalDebit', label: 'Total Debit', render: (b) => formatCurrency(b.totalDebit) },
    { key: 'currentBalance', label: 'Balance', render: (b) => formatCurrency(b.currentBalance) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (b) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(b)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(b)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className={styles.toolbar}>
        <Button onClick={() => setCreating(true)}>Add User Balance</Button>
      </div>

      <Table
        columns={columns}
        data={balancesQuery.data?.items ?? []}
        rowKey={(b) => b.id}
        loading={balancesQuery.isLoading}
        error={balancesQuery.isError ? toApiError(balancesQuery.error).message : null}
        emptyMessage="No user balances found"
      />

      {balancesQuery.data && (
        <Pagination
          page={balancesQuery.data.page}
          totalPages={balancesQuery.data.totalPages}
          total={balancesQuery.data.total}
          limit={balancesQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <CreateUserBalanceModal open={creating} onClose={() => setCreating(false)} />
      <EditBalanceModal
        title="Edit User Balance"
        balance={editing}
        queryKey={['pointUserBalances']}
        onUpdate={(id, payload) => pointUserBalanceService.update(id, payload)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete User Balance"
        message="This will permanently delete this balance record."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

function AdminBalancesTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PointAdminBalance | null>(null);
  const [deleting, setDeleting] = useState<PointAdminBalance | null>(null);

  const balancesQuery = useQuery({
    queryKey: ['pointAdminBalances', page, LIMIT],
    queryFn: () => pointAdminBalanceService.list({ page, limit: LIMIT }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pointAdminBalanceService.remove(id),
    onSuccess: () => {
      toast.success('Balance deleted.');
      queryClient.invalidateQueries({ queryKey: ['pointAdminBalances'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<PointAdminBalance>[] = [
    { key: 'adminId', label: 'Admin', render: (b) => b.admin?.username ?? `Admin #${b.adminId}` },
    { key: 'totalCredit', label: 'Total Credit', render: (b) => formatCurrency(b.totalCredit) },
    { key: 'totalDebit', label: 'Total Debit', render: (b) => formatCurrency(b.totalDebit) },
    { key: 'currentBalance', label: 'Balance', render: (b) => formatCurrency(b.currentBalance) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (b) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(b)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(b)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className={styles.toolbar}>
        <Button onClick={() => setCreating(true)}>Add Admin Balance</Button>
      </div>

      <Table
        columns={columns}
        data={balancesQuery.data?.items ?? []}
        rowKey={(b) => b.id}
        loading={balancesQuery.isLoading}
        error={balancesQuery.isError ? toApiError(balancesQuery.error).message : null}
        emptyMessage="No admin balances found"
      />

      {balancesQuery.data && (
        <Pagination
          page={balancesQuery.data.page}
          totalPages={balancesQuery.data.totalPages}
          total={balancesQuery.data.total}
          limit={balancesQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <CreateAdminBalanceModal open={creating} onClose={() => setCreating(false)} />
      <EditBalanceModal
        title="Edit Admin Balance"
        balance={editing}
        queryKey={['pointAdminBalances']}
        onUpdate={(id, payload) => pointAdminBalanceService.update(id, payload)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Admin Balance"
        message="This will permanently delete this balance record."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

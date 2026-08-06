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
import { pointTransactionsService } from '../../services/pointTransactions.service';
import { POINT_WALLET_TYPES, type PointTransaction, type PointWalletType } from '../../types/point.types';
import { formatDateTime } from '../../utils/formatters';
import { CreateTransactionModal } from './CreateTransactionModal';
import { EditTransactionModal } from './EditTransactionModal';
import styles from './PointTransactions.module.scss';

const LIMIT = 10;

export default function PointTransactionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [walletType, setWalletType] = useState<PointWalletType | ''>('');
  const [walletId, setWalletId] = useState('');
  const debouncedWalletId = useDebouncedValue(walletId);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PointTransaction | null>(null);
  const [deleting, setDeleting] = useState<PointTransaction | null>(null);

  const transactionsQuery = useQuery({
    queryKey: ['pointTransactions', page, LIMIT, walletType, debouncedWalletId],
    queryFn: () =>
      pointTransactionsService.list({
        page,
        limit: LIMIT,
        walletType: walletType || undefined,
        walletId: debouncedWalletId ? Number(debouncedWalletId) : undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pointTransactionsService.remove(id),
    onSuccess: () => {
      toast.success('Transaction deleted.');
      queryClient.invalidateQueries({ queryKey: ['pointTransactions'] });
      setDeleting(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<PointTransaction>[] = [
    { key: 'id', label: 'ID', width: '70px', render: (t) => `#${t.id}` },
    { key: 'wallet', label: 'Wallet', render: (t) => `${t.walletType} #${t.walletId}` },
    {
      key: 'transactionType',
      label: 'Type',
      render: (t) => <StatusBadge label={t.transactionType} tone={t.transactionType === 'CREDIT' ? 'success' : 'danger'} />,
    },
    { key: 'transactionReason', label: 'Reason' },
    { key: 'amount', label: 'Amount', render: (t) => String(t.amount) },
    { key: 'remarks', label: 'Remarks', render: (t) => <span className={styles.remark}>{t.remarks ?? '—'}</span> },
    { key: 'createdAt', label: 'Created', render: (t) => formatDateTime(t.createdAt) },
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
        title="Point Transactions"
        description="The full ledger of point credits and debits across user, admin, and pool wallets."
        actions={<Button onClick={() => setCreating(true)}>Add Transaction</Button>}
      />

      <div className={styles.filters}>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All wallet types"
            options={POINT_WALLET_TYPES.map((t) => ({ value: t, label: t }))}
            value={walletType}
            onChange={(e) => {
              setWalletType(e.target.value as PointWalletType | '');
              setPage(1);
            }}
          />
        </div>
        <div className={styles.filterInput}>
          <Input
            placeholder="Filter by wallet ID"
            value={walletId}
            onChange={(e) => {
              setWalletId(e.target.value.replace(/\D/g, ''));
              setPage(1);
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={transactionsQuery.data?.items ?? []}
        rowKey={(t) => t.id}
        loading={transactionsQuery.isLoading}
        error={transactionsQuery.isError ? toApiError(transactionsQuery.error).message : null}
        emptyMessage="No transactions found"
      />

      {transactionsQuery.data && (
        <Pagination
          page={transactionsQuery.data.page}
          totalPages={transactionsQuery.data.totalPages}
          total={transactionsQuery.data.total}
          limit={transactionsQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <CreateTransactionModal open={creating} onClose={() => setCreating(false)} />
      <EditTransactionModal transaction={editing} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Transaction"
        message="This will permanently remove this ledger entry. Wallet balances are not automatically recalculated."
        danger
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

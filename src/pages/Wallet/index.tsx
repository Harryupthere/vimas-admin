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
import { walletService } from '../../services/wallet.service';
import type { WalletOverview } from '../../types/wallet.types';
import { formatCurrency } from '../../utils/formatters';
import { AdjustWalletModal } from './AdjustWalletModal';
import { WalletTransactionsModal } from './WalletTransactionsModal';
import styles from './Wallet.module.scss';

const LIMIT = 10;

export default function WalletPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const [adjusting, setAdjusting] = useState<WalletOverview | null>(null);
  const [viewingTransactions, setViewingTransactions] = useState<WalletOverview | null>(null);
  const [statusTarget, setStatusTarget] = useState<WalletOverview | null>(null);

  const walletsQuery = useQuery({
    queryKey: ['wallets', page, LIMIT, debouncedSearch],
    queryFn: () => walletService.list({ page, limit: LIMIT, search: debouncedSearch || undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) => walletService.setStatus(userId, { isActive }),
    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? 'Wallet activated.' : 'Wallet deactivated.');
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setStatusTarget(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const columns: TableColumn<WalletOverview>[] = [
    {
      key: 'user',
      label: 'User',
      render: (w) => {
        const name = [w.first_name, w.last_name].filter(Boolean).join(' ');
        return (
          <div className={styles.userCell}>
            <span className={styles.userName}>{name || w.unique_user_id}</span>
            <span className={styles.userSub}>{w.email || w.unique_user_id}</span>
          </div>
        );
      },
    },
    { key: 'balance', label: 'Balance', render: (w) => <span className={styles.balance}>{formatCurrency(w.vimasEWalletBalance)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (w) => <StatusBadge label={w.vimasEWalletStatus ? 'Active' : 'Inactive'} tone={statusToneFromFlag(w.vimasEWalletStatus)} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (w) => (
        <div className={styles.actions}>
          <Button variant="primary" size="sm" onClick={() => setAdjusting(w)}>
            Add Funds
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewingTransactions(w)}>
            Transactions
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStatusTarget(w)}>
            {w.vimasEWalletStatus ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="E-Wallet"
        description="Every user's Vimas store-credit balance — add or remove funds and review the credit/debit ledger."
      />

      <div className={styles.filters}>
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search by name, email, user ID…" />
      </div>

      <Table
        columns={columns}
        data={walletsQuery.data?.items ?? []}
        rowKey={(w) => w.id}
        loading={walletsQuery.isLoading}
        error={walletsQuery.isError ? toApiError(walletsQuery.error).message : null}
        emptyMessage="No wallets found"
      />

      {walletsQuery.data && (
        <Pagination
          page={walletsQuery.data.page}
          totalPages={walletsQuery.data.totalPages}
          total={walletsQuery.data.total}
          limit={walletsQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <AdjustWalletModal wallet={adjusting} onClose={() => setAdjusting(null)} />
      <WalletTransactionsModal wallet={viewingTransactions} onClose={() => setViewingTransactions(null)} />

      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.vimasEWalletStatus ? 'Deactivate Wallet' : 'Activate Wallet'}
        message={
          statusTarget?.vimasEWalletStatus
            ? 'This wallet will be ignored at checkout even if the user requests to use it.'
            : 'This wallet becomes usable toward normal product checkout again.'
        }
        confirmLabel={statusTarget?.vimasEWalletStatus ? 'Deactivate' : 'Activate'}
        danger={!!statusTarget?.vimasEWalletStatus}
        loading={statusMutation.isPending}
        onConfirm={() => statusMutation.mutate({ userId: statusTarget!.id, isActive: !statusTarget!.vimasEWalletStatus })}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}

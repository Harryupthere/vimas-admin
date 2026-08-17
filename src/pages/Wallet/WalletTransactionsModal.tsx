import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { walletService } from '../../services/wallet.service';
import type { WalletOverview, WalletTransaction } from '../../types/wallet.types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export interface WalletTransactionsModalProps {
  wallet: WalletOverview | null;
  onClose: () => void;
}

const LIMIT = 10;

const TYPE_TONE: Record<WalletTransaction['type'], 'success' | 'danger' | 'info' | 'warning'> = {
  CREDIT: 'success',
  DEBIT: 'danger',
  CHECKOUT: 'info',
  REFUND: 'warning',
};

export function WalletTransactionsModal({ wallet, onClose }: WalletTransactionsModalProps) {
  const [page, setPage] = useState(1);
  const open = wallet !== null;

  const transactionsQuery = useQuery({
    queryKey: ['walletTransactions', wallet?.id, page, LIMIT],
    queryFn: () => walletService.transactions(wallet!.id, { page, limit: LIMIT }),
    enabled: open,
  });

  const handleClose = () => {
    setPage(1);
    onClose();
  };

  const columns: TableColumn<WalletTransaction>[] = [
    { key: 'type', label: 'Type', render: (t) => <StatusBadge label={t.type} tone={TYPE_TONE[t.type]} /> },
    { key: 'amount', label: 'Amount', render: (t) => formatCurrency(t.amount) },
    { key: 'balanceBefore', label: 'Before', render: (t) => formatCurrency(t.balanceBefore) },
    { key: 'balanceAfter', label: 'After', render: (t) => formatCurrency(t.balanceAfter) },
    { key: 'createdBy', label: 'By', render: (t) => t.createdBy },
    { key: 'description', label: 'Description', render: (t) => t.description ?? '—' },
    { key: 'createdAt', label: 'Date', render: (t) => formatDateTime(t.createdAt) },
  ];

  const displayName = wallet
    ? [wallet.first_name, wallet.last_name].filter(Boolean).join(' ') || wallet.unique_user_id
    : '';

  return (
    <Modal open={open} onClose={handleClose} title={`Wallet Transactions — ${displayName}`} size="lg">
      <Table
        columns={columns}
        data={transactionsQuery.data?.items ?? []}
        rowKey={(t) => t.id}
        loading={transactionsQuery.isLoading}
        error={transactionsQuery.isError ? toApiError(transactionsQuery.error).message : null}
        emptyMessage="No transactions yet"
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
    </Modal>
  );
}

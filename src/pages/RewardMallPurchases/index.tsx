import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Select } from '../../components/Select';
import { Table, type TableColumn } from '../../components/Table';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { toApiError } from '../../services/api';
import { rewardMallPurchaseStatusService } from '../../services/rewardMallPurchaseStatus.service';
import { rewardMallPurchasesService } from '../../services/rewardMallPurchases.service';
import type { RewardMallPurchase } from '../../types/rewardMallPurchase.types';
import { formatDate } from '../../utils/formatters';
import { PurchaseDetailModal } from './PurchaseDetailModal';
import { UpdatePurchaseModal } from './UpdatePurchaseModal';
import styles from './RewardMallPurchases.module.scss';

const LIMIT = 10;

export default function RewardMallPurchasesPage() {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [statusId, setStatusId] = useState('');
  const debouncedUserId = useDebouncedValue(userId);

  const [viewPurchaseId, setViewPurchaseId] = useState<number | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<RewardMallPurchase | null>(null);

  const statusesQuery = useQuery({
    queryKey: ['rewardMallPurchaseStatus'],
    queryFn: () => rewardMallPurchaseStatusService.list(),
  });

  const purchasesQuery = useQuery({
    queryKey: ['rewardMallPurchases', page, LIMIT, debouncedUserId, statusId],
    queryFn: () =>
      rewardMallPurchasesService.list({
        page,
        limit: LIMIT,
        userId: debouncedUserId ? Number(debouncedUserId) : undefined,
        statusId: statusId ? Number(statusId) : undefined,
      }),
  });

  const columns: TableColumn<RewardMallPurchase>[] = [
    { key: 'id', label: 'ID', width: '70px', render: (p) => `#${p.id}` },
    { key: 'product', label: 'Product', render: (p) => p.product?.name ?? `#${p.rewardMallProductId}` },
    { key: 'buyer', label: 'Buyer', render: (p) => p.user?.username ?? p.user?.email ?? `User #${p.userId}` },
    { key: 'quantity', label: 'Qty', render: (p) => String(p.quantity) },
    { key: 'pointsRedeemed', label: 'Points', render: (p) => `${p.pointsRedeemed} pts` },
    {
      key: 'status',
      label: 'Status',
      render: (p) =>
        p.status ? (
          <span className={styles.badge} style={{ background: p.status.colour || 'var(--gray-400)' }}>
            {p.status.name}
          </span>
        ) : (
          '—'
        ),
    },
    { key: 'createdAt', label: 'Redeemed', render: (p) => formatDate(p.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (p) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setViewPurchaseId(p.id)}>
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditingPurchase(p)}>
            Update
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Reward Mall Purchases" description="Point redemptions buyers have made — update fulfilment status here." />

      <div className={styles.filters}>
        <div className={styles.filterInput}>
          <Input
            placeholder="Filter by user ID"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value.replace(/\D/g, ''));
              setPage(1);
            }}
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All statuses"
            options={(statusesQuery.data ?? []).map((s) => ({ value: String(s.id), label: s.name }))}
            value={statusId}
            onChange={(e) => {
              setStatusId(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={purchasesQuery.data?.items ?? []}
        rowKey={(p) => p.id}
        loading={purchasesQuery.isLoading}
        error={purchasesQuery.isError ? toApiError(purchasesQuery.error).message : null}
        emptyMessage="No reward mall purchases found"
      />

      {purchasesQuery.data && (
        <Pagination
          page={purchasesQuery.data.page}
          totalPages={purchasesQuery.data.totalPages}
          total={purchasesQuery.data.total}
          limit={purchasesQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <PurchaseDetailModal purchaseId={viewPurchaseId} onClose={() => setViewPurchaseId(null)} />
      <UpdatePurchaseModal purchase={editingPurchase} onClose={() => setEditingPurchase(null)} />
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Table, type TableColumn } from '../../components/Table';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { toApiError } from '../../services/api';
import { productHistoryService } from '../../services/productHistory.service';
import type { ProductHistory } from '../../types/productHistory.types';
import { formatDateTime } from '../../utils/formatters';
import { HistoryDetailModal } from './HistoryDetailModal';
import styles from './ProductHistory.module.scss';

const LIMIT = 10;

export default function ProductHistoryPage() {
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState('');
  const debouncedProductId = useDebouncedValue(productId);
  const [viewEntry, setViewEntry] = useState<ProductHistory | null>(null);

  const historyQuery = useQuery({
    queryKey: ['productHistory', page, LIMIT, debouncedProductId],
    queryFn: () =>
      productHistoryService.list({
        page,
        limit: LIMIT,
        productId: debouncedProductId ? Number(debouncedProductId) : undefined,
      }),
  });

  const columns: TableColumn<ProductHistory>[] = [
    { key: 'id', label: 'ID', width: '80px', render: (h) => `#${h.id}` },
    { key: 'productId', label: 'Product ID', render: (h) => `#${h.productId}` },
    { key: 'tableName', label: 'Table' },
    { key: 'createdAt', label: 'Changed', render: (h) => formatDateTime(h.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (h) => (
        <Button variant="ghost" size="sm" onClick={() => setViewEntry(h)}>
          View Diff
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Product History" description="Read-only audit log of product-related changes." />

      <div className={styles.filters}>
        <div className={styles.filterInput}>
          <Input
            placeholder="Filter by product ID"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value.replace(/\D/g, ''));
              setPage(1);
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={historyQuery.data?.items ?? []}
        rowKey={(h) => h.id}
        loading={historyQuery.isLoading}
        error={historyQuery.isError ? toApiError(historyQuery.error).message : null}
        emptyMessage="No history entries found"
      />

      {historyQuery.data && (
        <Pagination
          page={historyQuery.data.page}
          totalPages={historyQuery.data.totalPages}
          total={historyQuery.data.total}
          limit={historyQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <HistoryDetailModal entry={viewEntry} onClose={() => setViewEntry(null)} />
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { ordersService } from '../../services/orders.service';
import type { Order } from '../../types/order.types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OrderDetailModal } from './OrderDetailModal';
import { UpdateOrderStatusModal } from './UpdateOrderStatusModal';
import styles from './Orders.module.scss';

const LIMIT = 10;

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [viewOrderId, setViewOrderId] = useState<number | null>(null);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);

  const ordersQuery = useQuery({
    queryKey: ['orders', page, LIMIT],
    queryFn: () => ordersService.list({ page, limit: LIMIT }),
  });

  const columns: TableColumn<Order>[] = [
    { key: 'id', label: 'Order', width: '90px', render: (o) => `#${o.id}` },
    {
      key: 'buyer',
      label: 'Buyer',
      render: (o) => o.buyer?.username ?? o.buyer?.email ?? `User #${o.buyerId}`,
    },
    { key: 'product', label: 'Product', render: (o) => o.product?.name ?? `#${o.productId}` },
    { key: 'quantity', label: 'Qty', render: (o) => String(o.quantity) },
    { key: 'totalAmount', label: 'Total', render: (o) => formatCurrency(o.totalAmount) },
    {
      key: 'orderStatus',
      label: 'Order Status',
      render: (o) => <StatusBadge label={o.orderStatus?.name ?? '—'} tone="info" />,
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (o) =>
        o.paymentStatus ? (
          <span className={styles.badge} style={{ background: o.paymentStatus.colour || 'var(--gray-400)' }}>
            {o.paymentStatus.name}
          </span>
        ) : (
          '—'
        ),
    },
    { key: 'createdAt', label: 'Placed', render: (o) => formatDate(o.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (o) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setViewOrderId(o.id)}>
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStatusOrder(o)}>
            Update Status
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Orders" description="View orders and update their status." />

      <Table
        columns={columns}
        data={ordersQuery.data?.items ?? []}
        rowKey={(o) => o.id}
        loading={ordersQuery.isLoading}
        error={ordersQuery.isError ? toApiError(ordersQuery.error).message : null}
        emptyMessage="No orders found"
      />

      {ordersQuery.data && (
        <Pagination
          page={ordersQuery.data.page}
          totalPages={ordersQuery.data.totalPages}
          total={ordersQuery.data.total}
          limit={ordersQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <OrderDetailModal orderId={viewOrderId} onClose={() => setViewOrderId(null)} />
      <UpdateOrderStatusModal order={statusOrder} onClose={() => setStatusOrder(null)} />
    </div>
  );
}

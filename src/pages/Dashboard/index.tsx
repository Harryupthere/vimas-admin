import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { usersService } from '../../services/users.service';
import { productsService } from '../../services/products.service';
import { ordersService } from '../../services/orders.service';
import { pointTransactionsService } from '../../services/pointTransactions.service';
import { BoxIcon, CartIcon, CoinsIcon, UsersIcon } from '../../layouts/AdminLayout/icons';
import type { User } from '../../types/user.types';
import type { Order } from '../../types/order.types';
import type { PointTransaction } from '../../types/point.types';
import styles from './Dashboard.module.scss';

const RECENT_LIMIT = 5;

export default function DashboardPage() {
  const usersQuery = useQuery({
    queryKey: ['dashboard', 'users'],
    queryFn: () => usersService.list({ page: 1, limit: RECENT_LIMIT }),
  });
  const productsQuery = useQuery({
    queryKey: ['dashboard', 'products'],
    queryFn: () => productsService.list({ page: 1, limit: 1 }),
  });
  const ordersQuery = useQuery({
    queryKey: ['dashboard', 'orders'],
    queryFn: () => ordersService.list({ page: 1, limit: RECENT_LIMIT }),
  });
  const transactionsQuery = useQuery({
    queryKey: ['dashboard', 'transactions'],
    queryFn: () => pointTransactionsService.list({ page: 1, limit: RECENT_LIMIT }),
  });
console.log("?????")
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your VimasGV platform." />

      <div className={styles.statGrid}>
        <StatCard
          label="Total Users"
          value={usersQuery.data?.total ?? 0}
          loading={usersQuery.isLoading}
          icon={<UsersIcon width={18} height={18} />}
        />
        <StatCard
          label="Total Products"
          value={productsQuery.data?.total ?? 0}
          loading={productsQuery.isLoading}
          icon={<BoxIcon width={18} height={18} />}
        />
        <StatCard
          label="Total Orders"
          value={ordersQuery.data?.total ?? 0}
          loading={ordersQuery.isLoading}
          icon={<CartIcon width={18} height={18} />}
        />
        <StatCard
          label="Point Transactions"
          value={transactionsQuery.data?.total ?? 0}
          loading={transactionsQuery.isLoading}
          icon={<CoinsIcon width={18} height={18} />}
        />
        {/* GET /admin/orders takes no status filter (Backend/src/orders/admin/orders.controller.ts
            only accepts page/limit), so these can't be computed without fetching every
            order client-side — left as placeholders until that param exists. */}
        <StatCard label="Pending Orders" value="—" placeholder />
        <StatCard label="Completed Orders" value="—" placeholder />
      </div>

      <div className={styles.panelGrid}>
        <RecentPanel<User>
          title="Recent Users"
          loading={usersQuery.isLoading}
          items={usersQuery.data?.items}
          renderItem={(user) => {
            const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
            return (
              <>
                <span className={styles.primaryText}>
                  {fullName || user.username || user.email || `User #${user.id}`}
                </span>
                <span className={styles.secondaryText}>{user.email ?? user.phone_number ?? ''}</span>
              </>
            );
          }}
          emptyLabel="No users yet"
        />

        <RecentPanel<Order>
          title="Recent Orders"
          loading={ordersQuery.isLoading}
          items={ordersQuery.data?.items}
          renderItem={(order) => (
            <>
              <span className={styles.primaryText}>Order #{order.id}</span>
              <span className={styles.secondaryText}>
                {order.totalAmount !== undefined ? `₹${order.totalAmount}` : ''}
                {order.orderStatus?.name ? ` · ${order.orderStatus.name}` : ''}
              </span>
            </>
          )}
          emptyLabel="No orders yet"
        />

        <RecentPanel<PointTransaction>
          title="Recent Transactions"
          loading={transactionsQuery.isLoading}
          items={transactionsQuery.data?.items}
          renderItem={(tx) => (
            <>
              <span className={styles.primaryText}>
                {tx.transactionType} · {tx.amount} pts
              </span>
              <span className={styles.secondaryText}>{tx.remarks ?? tx.transactionReason ?? ''}</span>
            </>
          )}
          emptyLabel="No transactions yet"
        />
      </div>
    </div>
  );
}

interface RecentPanelProps<T> {
  title: string;
  loading: boolean;
  items?: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyLabel: string;
}

function RecentPanel<T extends { id: number }>({ title, loading, items, renderItem, emptyLabel }: RecentPanelProps<T>) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>{title}</h3>
      {loading ? (
        <div className={styles.panelLoading}>
          <Loader size="sm" />
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState title={emptyLabel} />
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.listItem}>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Select } from '../../components/Select';
import { SearchInput } from '../../components/SearchInput';
import { StatusBadge } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { toApiError } from '../../services/api';
import { notificationCategoriesService } from '../../services/notificationCategories.service';
import { notificationTypesService } from '../../services/notificationTypes.service';
import { notificationsService } from '../../services/notifications.service';
import type { Notification } from '../../types/notification.types';
import { formatDateTime } from '../../utils/formatters';
import { EditNotificationModal } from './EditNotificationModal';
import { SendNotificationModal } from './SendNotificationModal';
import styles from './Notifications.module.scss';

const LIMIT = 10;

type PendingAction = { type: 'hide' | 'delete'; notification: Notification };

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [isRead, setIsRead] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const debouncedUserId = useDebouncedValue(userId);

  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['notificationCategories', 'all'],
    queryFn: () => notificationCategoriesService.list({ page: 1, limit: 100 }),
  });

  const typesQuery = useQuery({
    queryKey: ['notificationTypes', 'all'],
    queryFn: () => notificationTypesService.list({ page: 1, limit: 100 }),
  });

  const notificationsQuery = useQuery({
    queryKey: ['notifications', page, LIMIT, debouncedSearch, debouncedUserId, categoryId, typeId, isRead],
    queryFn: () =>
      notificationsService.list({
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        userId: debouncedUserId ? Number(debouncedUserId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        typeId: typeId ? Number(typeId) : undefined,
        isRead: isRead !== '' ? Number(isRead) : undefined,
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const hideMutation = useMutation({
    mutationFn: (id: number) => notificationsService.hide(id),
    onSuccess: () => {
      toast.success('Notification hidden.');
      invalidate();
      setPendingAction(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationsService.remove(id),
    onSuccess: () => {
      toast.success('Notification deleted.');
      invalidate();
      setPendingAction(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const resetPage = () => setPage(1);

  const columns: TableColumn<Notification>[] = [
    {
      key: 'notification',
      label: 'Notification',
      render: (n) => (
        <div className={styles.notificationCell}>
          <span className={styles.notificationHeading}>{n.heading}</span>
          {n.subheading && <span className={styles.notificationSub}>{n.subheading}</span>}
        </div>
      ),
    },
    { key: 'user', label: 'User', render: (n) => n.user?.username ?? n.user?.email ?? `User #${n.userId}` },
    { key: 'category', label: 'Category', render: (n) => n.category?.name ?? '—' },
    {
      key: 'type',
      label: 'Type',
      render: (n) =>
        n.type ? (
          <span
            className={styles.typeBadge}
            style={{ background: n.type.secondaryColor || 'var(--gray-100)', color: n.type.primaryColor || 'var(--text-primary)' }}
          >
            {n.type.name}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'isRead',
      label: 'Read',
      render: (n) => <StatusBadge label={n.isRead ? 'Read' : 'Unread'} tone={n.isRead ? 'neutral' : 'info'} />,
    },
    { key: 'createdAt', label: 'Sent', render: (n) => formatDateTime(n.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (n) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditing(n)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPendingAction({ type: 'hide', notification: n })}>
            Hide
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPendingAction({ type: 'delete', notification: n })}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'hide') {
      hideMutation.mutate(pendingAction.notification.id);
    } else {
      deleteMutation.mutate(pendingAction.notification.id);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Send push/in-app notifications to a single user or broadcast to everyone."
        actions={<Button onClick={() => setSending(true)}>Send Notification</Button>}
      />

      <div className={styles.filters}>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            resetPage();
          }}
          placeholder="Search heading, subheading, user…"
        />
        <div className={styles.filterInput}>
          <Input
            placeholder="Filter by user ID"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value.replace(/\D/g, ''));
              resetPage();
            }}
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All categories"
            options={(categoriesQuery.data?.items ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              resetPage();
            }}
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All types"
            options={(typesQuery.data?.items ?? []).map((t) => ({ value: String(t.id), label: t.name }))}
            value={typeId}
            onChange={(e) => {
              setTypeId(e.target.value);
              resetPage();
            }}
          />
        </div>
        <div className={styles.filterSelect}>
          <Select
            placeholder="Read & unread"
            options={[
              { value: '0', label: 'Unread' },
              { value: '1', label: 'Read' },
            ]}
            value={isRead}
            onChange={(e) => {
              setIsRead(e.target.value);
              resetPage();
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={notificationsQuery.data?.items ?? []}
        rowKey={(n) => n.id}
        loading={notificationsQuery.isLoading}
        error={notificationsQuery.isError ? toApiError(notificationsQuery.error).message : null}
        emptyMessage="No notifications found"
      />

      {notificationsQuery.data && (
        <Pagination
          page={notificationsQuery.data.page}
          totalPages={notificationsQuery.data.totalPages}
          total={notificationsQuery.data.total}
          limit={notificationsQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <SendNotificationModal open={sending} onClose={() => setSending(false)} />
      <EditNotificationModal notification={editing} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.type === 'delete' ? 'Delete Notification' : 'Hide Notification'}
        message={
          pendingAction?.type === 'delete'
            ? 'This will permanently delete this notification. This cannot be undone.'
            : "This hides the notification from the admin list without affecting the user's own view of it."
        }
        confirmLabel={pendingAction?.type === 'delete' ? 'Delete' : 'Hide'}
        danger={pendingAction?.type === 'delete'}
        loading={hideMutation.isPending || deleteMutation.isPending}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

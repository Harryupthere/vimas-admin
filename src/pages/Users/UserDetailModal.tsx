import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { StatusBadge, statusToneFromFlag } from '../../components/StatusBadge';
import { usersService } from '../../services/users.service';
import { formatDateTime } from '../../utils/formatters';
import styles from './Users.module.scss';

export interface UserDetailModalProps {
  userId: number | null;
  onClose: () => void;
}

export function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: () => usersService.getById(userId as number),
    enabled: userId !== null,
  });

  return (
    <Modal open={userId !== null} onClose={onClose} title="User Details" size="md">
      {isLoading || !user ? (
        <div className={styles.modalLoading}>
          <Loader />
        </div>
      ) : (
        <dl className={styles.detailGrid}>
          <Field label="Unique ID" value={user.unique_user_id} />
          <Field label="Status" value={<StatusBadge label={user.status ? 'Active' : 'Inactive'} tone={statusToneFromFlag(user.status)} />} />
          <Field label="Username" value={user.username ?? '—'} />
          <Field label="Name" value={[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'} />
          <Field label="Email" value={user.email ?? '—'} />
          <Field label="Email Verified" value={user.email_verified ? 'Yes' : 'No'} />
          <Field label="Phone" value={user.phone_number ?? '—'} />
          <Field label="Phone Verified" value={user.phone_number_verified ? 'Yes' : 'No'} />
          <Field label="Telegram ID" value={user.telegram_id ?? '—'} />
          <Field label="Country" value={user.country ?? '—'} />
          <Field label="Address" value={user.address ?? '—'} />
          <Field label="User Type" value={user.userType?.name ?? '—'} />
          <Field label="Registration Type" value={user.registrationType?.name ?? '—'} />
          <Field label="Joined" value={formatDateTime(user.created_at)} />
          <Field label="Last Updated" value={formatDateTime(user.updated_at)} />
          {user.is_admin_deleted === 1 && (
            <Field label="Admin Deleted Reason" value={user.admin_deleted_reason ?? '—'} />
          )}
        </dl>
      )}
    </Modal>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue}>{value}</dd>
    </div>
  );
}

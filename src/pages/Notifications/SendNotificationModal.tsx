import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { toApiError } from '../../services/api';
import { notificationCategoriesService } from '../../services/notificationCategories.service';
import { notificationTypesService } from '../../services/notificationTypes.service';
import { notificationsService } from '../../services/notifications.service';
import { usersService } from '../../services/users.service';
import type { CreateNotificationRequest } from '../../types/notification.types';
import type { User } from '../../types/user.types';
import { sendNotificationSchema, type SendNotificationFormValues } from './notification.schema';
import styles from './Notifications.module.scss';

export interface SendNotificationModalProps {
  open: boolean;
  onClose: () => void;
}

function formatUserLabel(user: User): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  const identity = user.email || user.username || user.unique_user_id || `User #${user.id}`;
  return fullName ? `${fullName} (${identity})` : identity;
}

export function SendNotificationModal({ open, onClose }: SendNotificationModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SendNotificationFormValues>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: { target: 'single' },
  });

  const target = watch('target');

  const categoriesQuery = useQuery({
    queryKey: ['notificationCategories', 'all'],
    queryFn: () => notificationCategoriesService.list({ page: 1, limit: 100 }),
    enabled: open,
  });

  const typesQuery = useQuery({
    queryKey: ['notificationTypes', 'all'],
    queryFn: () => notificationTypesService.list({ page: 1, limit: 100 }),
    enabled: open,
  });

  const usersQuery = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => usersService.list({ page: 1, limit: 100 }),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (values: SendNotificationFormValues) => {
      const payload: CreateNotificationRequest = {
        notificationCategoryId: Number(values.notificationCategoryId),
        notificationTypeId: Number(values.notificationTypeId),
        heading: values.heading,
        subheading: values.subheading || undefined,
        route: values.route || undefined,
        data: values.dataJson?.trim() ? JSON.parse(values.dataJson) : undefined,
        ...(values.target === 'broadcast' ? { broadcast: true } : { userId: Number(values.userId) }),
      };
      return notificationsService.create(payload);
    },
    onSuccess: (_, values) => {
      toast.success(values.target === 'broadcast' ? 'Notification broadcast to all users.' : 'Notification sent.');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      reset({ target: 'single' });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const handleClose = () => {
    reset({ target: 'single' });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Send Notification"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            {target === 'broadcast' ? 'Broadcast to All Users' : 'Send'}
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <div className={styles.radioGroup}>
          <label className={styles.radioRow}>
            <input type="radio" value="single" {...register('target')} />
            Single User
          </label>
          <label className={styles.radioRow}>
            <input type="radio" value="broadcast" {...register('target')} />
            Broadcast to All Active Users
          </label>
        </div>

        {target === 'single' && (
          <Select
            label="User"
            required
            placeholder="Select a user"
            options={(usersQuery.data?.items ?? []).map((u) => ({ value: String(u.id), label: formatUserLabel(u) }))}
            error={errors.userId?.message}
            {...register('userId')}
          />
        )}

        <div className={styles.row}>
          <Select
            label="Category"
            required
            placeholder="Select a category"
            options={(categoriesQuery.data?.items ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
            error={errors.notificationCategoryId?.message}
            {...register('notificationCategoryId')}
          />
          <Select
            label="Type"
            required
            placeholder="Select a type"
            options={(typesQuery.data?.items ?? []).map((t) => ({ value: String(t.id), label: t.name }))}
            error={errors.notificationTypeId?.message}
            {...register('notificationTypeId')}
          />
        </div>

        <Input label="Heading" required error={errors.heading?.message} {...register('heading')} />
        <Input label="Subheading" error={errors.subheading?.message} {...register('subheading')} />
        <Input
          label="Route"
          hint="Deep link the app navigates to when tapped, e.g. /orders/123"
          error={errors.route?.message}
          {...register('route')}
        />
        <Textarea
          label="Data (advanced)"
          hint='Raw JSON object, e.g. {"orderId": 12}'
          className={styles.jsonTextarea}
          rows={3}
          error={errors.dataJson?.message}
          {...register('dataJson')}
        />
      </form>
    </Modal>
  );
}

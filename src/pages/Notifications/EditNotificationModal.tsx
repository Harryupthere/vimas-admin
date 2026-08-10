import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Textarea } from '../../components/Textarea';
import { toApiError } from '../../services/api';
import { notificationsService } from '../../services/notifications.service';
import type { Notification, UpdateNotificationRequest } from '../../types/notification.types';
import { editNotificationSchema, type EditNotificationFormValues } from './notification.schema';
import styles from './Notifications.module.scss';

export interface EditNotificationModalProps {
  notification: Notification | null;
  onClose: () => void;
}

// Only display content is mutable here — target user/category/type are
// fixed at send time (see UpdateNotificationRequest's docstring).
export function EditNotificationModal({ notification, onClose }: EditNotificationModalProps) {
  const queryClient = useQueryClient();
  const open = notification !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditNotificationFormValues>({ resolver: zodResolver(editNotificationSchema) });

  useEffect(() => {
    if (open && notification) {
      reset({
        heading: notification.heading,
        subheading: notification.subheading ?? '',
        route: notification.route ?? '',
        dataJson: notification.data ? JSON.stringify(notification.data, null, 2) : '',
      });
    }
  }, [open, notification, reset]);

  const mutation = useMutation({
    mutationFn: (values: EditNotificationFormValues) => {
      const payload: UpdateNotificationRequest = {
        heading: values.heading,
        subheading: values.subheading || undefined,
        route: values.route || undefined,
        data: values.dataJson?.trim() ? JSON.parse(values.dataJson) : undefined,
      };
      return notificationsService.update(notification!.id, payload);
    },
    onSuccess: () => {
      toast.success('Notification updated.');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Notification #${notification?.id ?? ''}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            Save Changes
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Input label="Heading" required error={errors.heading?.message} {...register('heading')} />
        <Input label="Subheading" error={errors.subheading?.message} {...register('subheading')} />
        <Input label="Route" error={errors.route?.message} {...register('route')} />
        <Textarea
          label="Data (advanced)"
          className={styles.jsonTextarea}
          rows={3}
          error={errors.dataJson?.message}
          {...register('dataJson')}
        />
      </form>
    </Modal>
  );
}

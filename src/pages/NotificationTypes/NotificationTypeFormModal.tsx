import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { toApiError } from '../../services/api';
import { notificationTypesService } from '../../services/notificationTypes.service';
import type { NotificationType } from '../../types/notificationType.types';
import { notificationTypeSchema, type NotificationTypeFormValues } from './notificationType.schema';
import styles from './NotificationTypes.module.scss';

export interface NotificationTypeFormModalProps {
  open: boolean;
  type: NotificationType | null;
  onClose: () => void;
}

export function NotificationTypeFormModal({ open, type, onClose }: NotificationTypeFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = type !== null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NotificationTypeFormValues>({ resolver: zodResolver(notificationTypeSchema) });

  const primaryColor = watch('primaryColor');
  const secondaryColor = watch('secondaryColor');

  useEffect(() => {
    if (open) {
      reset({
        name: type?.name ?? '',
        description: type?.description ?? '',
        primaryColor: type?.primaryColor ?? '#4F46E5',
        secondaryColor: type?.secondaryColor ?? '#E0E7FF',
        status: type?.status ?? 1,
      });
    }
  }, [open, type, reset]);

  const mutation = useMutation({
    mutationFn: (values: NotificationTypeFormValues) =>
      isEdit ? notificationTypesService.update(type!.id, values) : notificationTypesService.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Type updated.' : 'Type created.');
      queryClient.invalidateQueries({ queryKey: ['notificationTypes'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Notification Type' : 'Add Notification Type'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create'}
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
        <div className={styles.row}>
          <div className={styles.colourField}>
            <Input label="Primary Colour" error={errors.primaryColor?.message} {...register('primaryColor')} />
            <input
              type="color"
              className={styles.colourInput}
              value={primaryColor || '#000000'}
              onChange={(e) => setValue('primaryColor', e.target.value, { shouldDirty: true })}
            />
          </div>
          <div className={styles.colourField}>
            <Input label="Secondary Colour" error={errors.secondaryColor?.message} {...register('secondaryColor')} />
            <input
              type="color"
              className={styles.colourInput}
              value={secondaryColor || '#000000'}
              onChange={(e) => setValue('secondaryColor', e.target.value, { shouldDirty: true })}
            />
          </div>
        </div>
        <Select
          label="Status"
          options={[
            { value: '1', label: 'Active' },
            { value: '0', label: 'Inactive' },
          ]}
          {...register('status')}
        />
      </form>
    </Modal>
  );
}

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
import { notificationCategoriesService } from '../../services/notificationCategories.service';
import type { NotificationCategory } from '../../types/notificationCategory.types';
import { notificationCategorySchema, type NotificationCategoryFormValues } from './notificationCategory.schema';
import styles from './NotificationCategories.module.scss';

export interface NotificationCategoryFormModalProps {
  open: boolean;
  category: NotificationCategory | null;
  onClose: () => void;
}

export function NotificationCategoryFormModal({ open, category, onClose }: NotificationCategoryFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = category !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NotificationCategoryFormValues>({ resolver: zodResolver(notificationCategorySchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? '',
        description: category?.description ?? '',
        icon: category?.icon ?? '',
        status: category?.status ?? 1,
        userPreference: category?.userPreference ?? false,
      });
    }
  }, [open, category, reset]);

  const mutation = useMutation({
    mutationFn: (values: NotificationCategoryFormValues) =>
      isEdit
        ? notificationCategoriesService.update(category!.id, values)
        : notificationCategoriesService.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Category updated.' : 'Category created.');
      queryClient.invalidateQueries({ queryKey: ['notificationCategories'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Notification Category' : 'Add Notification Category'}
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
          <Input label="Icon" hint="e.g. megaphone" error={errors.icon?.message} {...register('icon')} />
          <Select
            label="Status"
            options={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ]}
            {...register('status')}
          />
        </div>
        <label className={styles.checkboxRow}>
          <input type="checkbox" {...register('userPreference')} />
          Users can toggle this category off in their notification preferences
        </label>
      </form>
    </Modal>
  );
}

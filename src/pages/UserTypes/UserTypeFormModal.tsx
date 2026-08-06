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
import { userTypesService } from '../../services/userTypes.service';
import type { UserType } from '../../types/userType.types';
import { userTypeSchema, type UserTypeFormValues } from './userType.schema';
import styles from './UserTypes.module.scss';

export interface UserTypeFormModalProps {
  open: boolean;
  userType: UserType | null;
  onClose: () => void;
}

export function UserTypeFormModal({ open, userType, onClose }: UserTypeFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = userType !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserTypeFormValues>({ resolver: zodResolver(userTypeSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: userType?.name ?? '',
        description: userType?.description ?? '',
        icon: userType?.icon ?? '',
        key_points: userType?.key_points?.join('\n') ?? '',
        status: userType?.status ?? 1,
      });
    }
  }, [open, userType, reset]);

  const mutation = useMutation({
    mutationFn: (values: UserTypeFormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        icon: values.icon || undefined,
        key_points: values.key_points
          ? values.key_points.split('\n').map((l) => l.trim()).filter(Boolean)
          : undefined,
        status: values.status,
      };
      return isEdit ? userTypesService.update(userType!.id, payload) : userTypesService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'User type updated.' : 'User type created.');
      queryClient.invalidateQueries({ queryKey: ['userTypes'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit User Type' : 'Add User Type'}
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
          <Input label="Icon URL" error={errors.icon?.message} {...register('icon')} />
          <Select
            label="Status"
            options={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ]}
            {...register('status')}
          />
        </div>
        <Textarea label="Key Points" hint="One per line." error={errors.key_points?.message} {...register('key_points')} />
      </form>
    </Modal>
  );
}

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
import { rewardMallCategoriesService } from '../../services/rewardMallCategories.service';
import type { RewardMallCategory } from '../../types/rewardMallCategory.types';
import { rewardMallCategorySchema, type RewardMallCategoryFormValues } from './rewardMallCategory.schema';
import styles from './RewardMallCategories.module.scss';

export interface RewardMallCategoryFormModalProps {
  open: boolean;
  category: RewardMallCategory | null;
  onClose: () => void;
}

export function RewardMallCategoryFormModal({ open, category, onClose }: RewardMallCategoryFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = category !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RewardMallCategoryFormValues>({ resolver: zodResolver(rewardMallCategorySchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? '',
        description: category?.description ?? '',
        icon: category?.icon ?? '',
        sortOrder: category?.sortOrder ?? 0,
        status: category?.status ?? 1,
      });
    }
  }, [open, category, reset]);

  const mutation = useMutation({
    mutationFn: (values: RewardMallCategoryFormValues) =>
      isEdit
        ? rewardMallCategoriesService.update(category!.id, values)
        : rewardMallCategoriesService.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Category updated.' : 'Category created.');
      queryClient.invalidateQueries({ queryKey: ['rewardMallCategories'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Reward Mall Category' : 'Add Reward Mall Category'}
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
          <Input label="Sort Order" type="number" error={errors.sortOrder?.message} {...register('sortOrder')} />
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

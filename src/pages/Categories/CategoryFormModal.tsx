import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { toApiError } from '../../services/api';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../types/category.types';
import { categorySchema, type CategoryFormValues } from './category.schema';
import styles from './Categories.module.scss';

export interface CategoryFormModalProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}

export function CategoryFormModal({ open, category, onClose }: CategoryFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = category !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema) });

  useEffect(() => {
    if (open) {
      reset({ name: category?.name ?? '', parent_id: category?.parent_id ? String(category.parent_id) : '' });
    }
  }, [open, category, reset]);

  // Used to populate the "Parent Category" dropdown — a flat list is good
  // enough here since GET /admin/categories has no tree/nesting depth limit.
  const parentOptionsQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesService.list({ page: 1, limit: 200 }),
    enabled: open,
    staleTime: 60_000,
  });

  const parentOptions = useMemo(
    () =>
      (parentOptionsQuery.data?.items ?? [])
        .filter((c) => c.id !== category?.id)
        .map((c) => ({ value: String(c.id), label: c.name })),
    [parentOptionsQuery.data, category],
  );

  const mutation = useMutation({
    mutationFn: (values: CategoryFormValues) => {
      const payload = {
        name: values.name,
        parent_id: values.parent_id ? Number(values.parent_id) : undefined,
      };
      return isEdit ? categoriesService.update(category!.id, payload) : categoriesService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Category updated.' : 'Category created.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const onSubmit = (values: CategoryFormValues) => mutation.mutate(values);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'Add Category'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <Select
          label="Parent Category"
          placeholder="No parent (top-level)"
          options={parentOptions}
          {...register('parent_id')}
        />
      </form>
    </Modal>
  );
}

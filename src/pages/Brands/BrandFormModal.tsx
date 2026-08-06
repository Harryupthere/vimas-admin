import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { toApiError } from '../../services/api';
import { brandsService } from '../../services/brands.service';
import type { Brand } from '../../types/brand.types';
import { brandSchema, type BrandFormValues } from './brand.schema';
import styles from './Brands.module.scss';

export interface BrandFormModalProps {
  open: boolean;
  brand: Brand | null;
  onClose: () => void;
}

export function BrandFormModal({ open, brand, onClose }: BrandFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = brand !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({ resolver: zodResolver(brandSchema) });

  useEffect(() => {
    if (open) reset({ name: brand?.name ?? '' });
  }, [open, brand, reset]);

  const mutation = useMutation({
    mutationFn: (values: BrandFormValues) =>
      isEdit ? brandsService.update(brand!.id, values) : brandsService.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Brand updated.' : 'Brand created.');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Brand' : 'Add Brand'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Brand'}
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Input label="Name" required error={errors.name?.message} {...register('name')} />
      </form>
    </Modal>
  );
}

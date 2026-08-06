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
import { orderStatusService } from '../../services/orderStatus.service';
import type { OrderStatus } from '../../types/orderStatus.types';
import { orderStatusSchema, type OrderStatusFormValues } from './orderStatus.schema';
import styles from './OrderStatus.module.scss';

export interface OrderStatusFormModalProps {
  open: boolean;
  status: OrderStatus | null;
  onClose: () => void;
}

export function OrderStatusFormModal({ open, status, onClose }: OrderStatusFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = status !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderStatusFormValues>({ resolver: zodResolver(orderStatusSchema) });

  useEffect(() => {
    if (open) reset({ name: status?.name ?? '', description: status?.description ?? '' });
  }, [open, status, reset]);

  const mutation = useMutation({
    mutationFn: (values: OrderStatusFormValues) =>
      isEdit ? orderStatusService.update(status!.id, values) : orderStatusService.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Order status updated.' : 'Order status created.');
      queryClient.invalidateQueries({ queryKey: ['orderStatus'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Order Status' : 'Add Order Status'}
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
      </form>
    </Modal>
  );
}

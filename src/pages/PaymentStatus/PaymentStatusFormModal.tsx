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
import { paymentStatusService } from '../../services/paymentStatus.service';
import type { PaymentStatus } from '../../types/paymentStatus.types';
import { paymentStatusSchema, type PaymentStatusFormValues } from './paymentStatus.schema';
import styles from './PaymentStatus.module.scss';

export interface PaymentStatusFormModalProps {
  open: boolean;
  status: PaymentStatus | null;
  onClose: () => void;
}

export function PaymentStatusFormModal({ open, status, onClose }: PaymentStatusFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = status !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentStatusFormValues>({ resolver: zodResolver(paymentStatusSchema) });

  useEffect(() => {
    if (open) {
      reset({ name: status?.name ?? '', description: status?.description ?? '', colour: status?.colour ?? '#6b7280' });
    }
  }, [open, status, reset]);

  const mutation = useMutation({
    mutationFn: (values: PaymentStatusFormValues) =>
      isEdit ? paymentStatusService.update(status!.id, values) : paymentStatusService.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Payment status updated.' : 'Payment status created.');
      queryClient.invalidateQueries({ queryKey: ['paymentStatus'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Payment Status' : 'Add Payment Status'}
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
        <div className={styles.row}>
          <Input label="Name" required error={errors.name?.message} {...register('name')} />
          <input type="color" className={styles.colourInput} {...register('colour')} />
        </div>
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
      </form>
    </Modal>
  );
}

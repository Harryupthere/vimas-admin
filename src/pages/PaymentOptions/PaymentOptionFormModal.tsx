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
import { paymentOptionsService } from '../../services/paymentOptions.service';
import type { PaymentOption } from '../../types/paymentOption.types';
import { paymentOptionSchema, type PaymentOptionFormValues } from './paymentOption.schema';
import styles from './PaymentOptions.module.scss';

export interface PaymentOptionFormModalProps {
  open: boolean;
  option: PaymentOption | null;
  onClose: () => void;
}

export function PaymentOptionFormModal({ open, option, onClose }: PaymentOptionFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = option !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentOptionFormValues>({ resolver: zodResolver(paymentOptionSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: option?.name ?? '',
        description: option?.description ?? '',
        charges: option?.charges ?? 0,
        note: option?.note?.join('\n') ?? '',
        status: option?.status ?? 1,
      });
    }
  }, [open, option, reset]);

  const mutation = useMutation({
    mutationFn: async (values: PaymentOptionFormValues) => {
      const payload = {
        name: values.name,
        description: values.description,
        charges: values.charges,
        note: values.note
          ? values.note.split('\n').map((line) => line.trim()).filter(Boolean)
          : [],
        status: values.status,
      };
      if (isEdit) {
        await paymentOptionsService.update(option!.id, payload);
      } else {
        await paymentOptionsService.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Payment option updated.' : 'Payment option created.');
      queryClient.invalidateQueries({ queryKey: ['paymentOptions'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Payment Option' : 'Add Payment Option'}
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
        <Textarea label="Description" required error={errors.description?.message} {...register('description')} />
        <div className={styles.row}>
          <Input label="Charges" type="number" step="0.01" error={errors.charges?.message} {...register('charges')} />
          <Select
            label="Status"
            options={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ]}
            {...register('status')}
          />
        </div>
        <Textarea
          label="Notes"
          hint="One note per line."
          error={errors.note?.message}
          {...register('note')}
        />
      </form>
    </Modal>
  );
}

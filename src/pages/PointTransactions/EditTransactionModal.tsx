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
import { pointTransactionsService } from '../../services/pointTransactions.service';
import { POINT_TRANSACTION_REASONS, type PointTransaction, type UpdatePointTransactionRequest } from '../../types/point.types';
import { editPointTransactionSchema, type EditPointTransactionFormValues } from './pointTransaction.schema';
import styles from './PointTransactions.module.scss';

export interface EditTransactionModalProps {
  transaction: PointTransaction | null;
  onClose: () => void;
}

// Wallet identity fields are read-only here — see UpdatePointTransactionRequest's
// docstring: the backend DTO deliberately omits them from what update() accepts.
export function EditTransactionModal({ transaction, onClose }: EditTransactionModalProps) {
  const queryClient = useQueryClient();
  const open = transaction !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditPointTransactionFormValues>({ resolver: zodResolver(editPointTransactionSchema) });

  useEffect(() => {
    if (open && transaction) {
      reset({
        amount: transaction.amount,
        transactionReason: transaction.transactionReason,
        remarks: transaction.remarks ?? '',
      });
    }
  }, [open, transaction, reset]);

  const mutation = useMutation({
    mutationFn: (values: EditPointTransactionFormValues) =>
      pointTransactionsService.update(transaction!.id, values as UpdatePointTransactionRequest),
    onSuccess: () => {
      toast.success('Transaction updated.');
      queryClient.invalidateQueries({ queryKey: ['pointTransactions'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Transaction #${transaction?.id ?? ''}`}
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
        <Input label="Amount" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />
        <Select
          label="Reason"
          required
          options={POINT_TRANSACTION_REASONS.map((t) => ({ value: t, label: t }))}
          {...register('transactionReason')}
        />
        <Textarea label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </Modal>
  );
}

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
import { POINT_TRANSACTION_REASONS, POINT_TRANSACTION_TYPES, POINT_WALLET_TYPES } from '../../types/point.types';
import type { CreatePointTransactionRequest } from '../../types/point.types';
import { createPointTransactionSchema, type CreatePointTransactionFormValues } from './pointTransaction.schema';
import styles from './PointTransactions.module.scss';

export interface CreateTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTransactionModal({ open, onClose }: CreateTransactionModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePointTransactionFormValues>({ resolver: zodResolver(createPointTransactionSchema) });

  const mutation = useMutation({
    mutationFn: (values: CreatePointTransactionFormValues) =>
      pointTransactionsService.create(values as CreatePointTransactionRequest),
    onSuccess: () => {
      toast.success('Transaction created.');
      queryClient.invalidateQueries({ queryKey: ['pointTransactions'] });
      reset({});
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const handleClose = () => {
    reset({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Point Transaction"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            Create Transaction
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <div className={styles.row}>
          <Select
            label="Wallet Type"
            required
            options={POINT_WALLET_TYPES.map((t) => ({ value: t, label: t }))}
            {...register('walletType')}
          />
          <Input label="Wallet ID" type="number" required error={errors.walletId?.message} {...register('walletId')} />
        </div>

        <div className={styles.row}>
          <Select
            label="Transaction Type"
            required
            options={POINT_TRANSACTION_TYPES.map((t) => ({ value: t, label: t }))}
            {...register('transactionType')}
          />
          <Select
            label="Reason"
            required
            options={POINT_TRANSACTION_REASONS.map((t) => ({ value: t, label: t }))}
            {...register('transactionReason')}
          />
        </div>

        <Input label="Amount" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />

        <div className={styles.row3}>
          <Input label="Source User ID" type="number" {...register('sourceUserId')} />
          <Input label="Source Admin ID" type="number" {...register('sourceAdminId')} />
          <Input label="Product ID" type="number" {...register('productId')} />
        </div>

        <div className={styles.row3}>
          <Input label="Order ID" type="number" {...register('orderId')} />
          <Input label="Distribution Rule ID" type="number" {...register('pointDistributionId')} />
          <Input label="Pool ID" type="number" {...register('poolId')} />
        </div>

        <Textarea label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </Modal>
  );
}

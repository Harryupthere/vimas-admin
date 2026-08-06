import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { toApiError } from '../../services/api';
import type { UpdatePointBalanceRequest } from '../../types/pointWallet.types';
import { editBalanceSchema, type EditBalanceFormValues } from './pointWallet.schema';
import styles from './PointWallets.module.scss';

export interface EditableBalance {
  id: number;
  totalCredit: number;
  totalDebit: number;
  currentBalance: number;
}

export interface EditBalanceModalProps {
  title: string;
  balance: EditableBalance | null;
  queryKey: string[];
  onUpdate: (id: number, payload: UpdatePointBalanceRequest) => Promise<unknown>;
  onClose: () => void;
}

// Shared by both the User and Admin wallet tabs — the update shape and
// backend restriction (owner id can never be reassigned) are identical.
export function EditBalanceModal({ title, balance, queryKey, onUpdate, onClose }: EditBalanceModalProps) {
  const queryClient = useQueryClient();
  const open = balance !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditBalanceFormValues>({ resolver: zodResolver(editBalanceSchema) });

  useEffect(() => {
    if (open && balance) {
      reset({
        totalCredit: balance.totalCredit,
        totalDebit: balance.totalDebit,
        currentBalance: balance.currentBalance,
      });
    }
  }, [open, balance, reset]);

  const mutation = useMutation({
    mutationFn: (values: EditBalanceFormValues) => onUpdate(balance!.id, values),
    onSuccess: () => {
      toast.success('Balance updated.');
      queryClient.invalidateQueries({ queryKey });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
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
        <Input label="Total Credit" type="number" step="0.01" {...register('totalCredit')} />
        <Input label="Total Debit" type="number" step="0.01" {...register('totalDebit')} />
        <Input label="Current Balance" type="number" step="0.01" {...register('currentBalance')} />
      </form>
    </Modal>
  );
}

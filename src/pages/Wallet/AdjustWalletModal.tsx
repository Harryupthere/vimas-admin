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
import { walletService } from '../../services/wallet.service';
import type { WalletOverview } from '../../types/wallet.types';
import { formatCurrency } from '../../utils/formatters';
import { adjustWalletSchema, type AdjustWalletFormValues } from './wallet.schema';
import styles from './Wallet.module.scss';

export interface AdjustWalletModalProps {
  wallet: WalletOverview | null;
  onClose: () => void;
}

// Admin adds (credit) or removes (debit) store credit for a user's e-wallet
// — POST /admin/wallet/:userId/credit|debit. Both write a ledger row
// (VimasEWalletTransaction) server-side under a row lock.
export function AdjustWalletModal({ wallet, onClose }: AdjustWalletModalProps) {
  const queryClient = useQueryClient();
  const open = wallet !== null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdjustWalletFormValues>({
    resolver: zodResolver(adjustWalletSchema),
    defaultValues: { type: 'CREDIT', amount: 0, description: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ type: 'CREDIT', amount: 0, description: '' });
    }
  }, [open, wallet?.id, reset]);

  const type = watch('type');

  const mutation = useMutation({
    mutationFn: (values: AdjustWalletFormValues) => {
      const payload = { amount: values.amount, description: values.description || undefined };
      return values.type === 'CREDIT' ? walletService.credit(wallet!.id, payload) : walletService.debit(wallet!.id, payload);
    },
    onSuccess: (_, values) => {
      toast.success(values.type === 'CREDIT' ? 'Funds added to wallet.' : 'Funds removed from wallet.');
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['walletTransactions'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  if (!wallet) return null;

  const displayName = [wallet.first_name, wallet.last_name].filter(Boolean).join(' ') || wallet.unique_user_id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adjust Wallet Balance"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={type === 'DEBIT' ? 'danger' : 'primary'}
            onClick={handleSubmit((v) => mutation.mutate(v))}
            loading={isSubmitting}
          >
            {type === 'CREDIT' ? 'Add Funds' : 'Remove Funds'}
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <div className={styles.balanceSummary}>
          <span>{displayName}</span>
          <span className={styles.balanceValue}>{formatCurrency(wallet.vimasEWalletBalance)}</span>
        </div>

        <div className={styles.typeToggle}>
          <button
            type="button"
            className={[styles.typeBtn, type === 'CREDIT' ? styles.typeBtnActive : ''].filter(Boolean).join(' ')}
            onClick={() => setValue('type', 'CREDIT')}
          >
            Add Funds
          </button>
          <button
            type="button"
            className={[styles.typeBtn, type === 'DEBIT' ? styles.typeBtnActive : ''].filter(Boolean).join(' ')}
            onClick={() => setValue('type', 'DEBIT')}
          >
            Remove Funds
          </button>
        </div>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Textarea
          label="Description"
          rows={2}
          hint="Shown on the user's wallet ledger, e.g. “Manual top-up”."
          {...register('description')}
        />
      </form>
    </Modal>
  );
}

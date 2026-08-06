import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { toApiError } from '../../services/api';
import { pointUserBalanceService } from '../../services/pointWallets.service';
import { createUserBalanceSchema, type CreateUserBalanceFormValues } from './pointWallet.schema';
import styles from './PointWallets.module.scss';

export interface CreateUserBalanceModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateUserBalanceModal({ open, onClose }: CreateUserBalanceModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserBalanceFormValues>({ resolver: zodResolver(createUserBalanceSchema) });

  const mutation = useMutation({
    mutationFn: (values: CreateUserBalanceFormValues) => pointUserBalanceService.create(values),
    onSuccess: () => {
      toast.success('Balance created.');
      queryClient.invalidateQueries({ queryKey: ['pointUserBalances'] });
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
      title="Add User Balance"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            Create
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Input label="User ID" type="number" required error={errors.userId?.message} {...register('userId')} />
        <div className={styles.row3}>
          <Input label="Total Credit" type="number" step="0.01" {...register('totalCredit')} />
          <Input label="Total Debit" type="number" step="0.01" {...register('totalDebit')} />
          <Input label="Current Balance" type="number" step="0.01" {...register('currentBalance')} />
        </div>
      </form>
    </Modal>
  );
}

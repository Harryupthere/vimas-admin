import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { toApiError } from '../../services/api';
import { pointAdminBalanceService } from '../../services/pointWallets.service';
import { createAdminBalanceSchema, type CreateAdminBalanceFormValues } from './pointWallet.schema';
import styles from './PointWallets.module.scss';

export interface CreateAdminBalanceModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAdminBalanceModal({ open, onClose }: CreateAdminBalanceModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminBalanceFormValues>({ resolver: zodResolver(createAdminBalanceSchema) });

  const mutation = useMutation({
    mutationFn: (values: CreateAdminBalanceFormValues) => pointAdminBalanceService.create(values),
    onSuccess: () => {
      toast.success('Balance created.');
      queryClient.invalidateQueries({ queryKey: ['pointAdminBalances'] });
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
      title="Add Admin Balance"
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
        <Input label="Admin ID" type="number" required error={errors.adminId?.message} {...register('adminId')} />
        <div className={styles.row3}>
          <Input label="Total Credit" type="number" step="0.01" {...register('totalCredit')} />
          <Input label="Total Debit" type="number" step="0.01" {...register('totalDebit')} />
          <Input label="Current Balance" type="number" step="0.01" {...register('currentBalance')} />
        </div>
      </form>
    </Modal>
  );
}

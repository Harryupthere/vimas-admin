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
import { rewardMallPurchaseStatusService } from '../../services/rewardMallPurchaseStatus.service';
import type { RewardMallPurchaseStatus } from '../../types/rewardMallPurchaseStatus.types';
import {
  rewardMallPurchaseStatusSchema,
  type RewardMallPurchaseStatusFormValues,
} from './rewardMallPurchaseStatus.schema';
import styles from './RewardMallPurchaseStatus.module.scss';

export interface RewardMallPurchaseStatusFormModalProps {
  open: boolean;
  status: RewardMallPurchaseStatus | null;
  onClose: () => void;
}

export function RewardMallPurchaseStatusFormModal({ open, status, onClose }: RewardMallPurchaseStatusFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = status !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RewardMallPurchaseStatusFormValues>({ resolver: zodResolver(rewardMallPurchaseStatusSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: status?.name ?? '',
        description: status?.description ?? '',
        colour: status?.colour ?? '#4F46E5',
        icon: status?.icon ?? '',
        symbol: status?.symbol ?? '',
      });
    }
  }, [open, status, reset]);

  const mutation = useMutation({
    mutationFn: (values: RewardMallPurchaseStatusFormValues) =>
      isEdit
        ? rewardMallPurchaseStatusService.update(status!.id, values)
        : rewardMallPurchaseStatusService.create(values),
    onSuccess: () => {
      toast.success(isEdit ? 'Status updated.' : 'Status created.');
      queryClient.invalidateQueries({ queryKey: ['rewardMallPurchaseStatus'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Purchase Status' : 'Add Purchase Status'}
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
        <div className={styles.row2}>
          <Input label="Symbol" hint="e.g. PENDING, SHIPPED" error={errors.symbol?.message} {...register('symbol')} />
          <Input label="Icon URL" error={errors.icon?.message} {...register('icon')} />
        </div>
      </form>
    </Modal>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { toApiError } from '../../services/api';
import { rewardMallPurchaseStatusService } from '../../services/rewardMallPurchaseStatus.service';
import { rewardMallPurchasesService } from '../../services/rewardMallPurchases.service';
import type { RewardMallPurchase } from '../../types/rewardMallPurchase.types';
import styles from './RewardMallPurchases.module.scss';

export interface UpdatePurchaseModalProps {
  purchase: RewardMallPurchase | null;
  onClose: () => void;
}

interface FormValues {
  statusId: string;
  trackingNumber: string;
  deliveredAt: string;
  newRemark: string;
}

// deliveredAt uses a datetime-local input — ISO strings need trimming to
// "YYYY-MM-DDTHH:mm" for the input and expanding back to ISO on submit.
function toLocalInputValue(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export function UpdatePurchaseModal({ purchase, onClose }: UpdatePurchaseModalProps) {
  const queryClient = useQueryClient();
  const open = purchase !== null;

  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (open && purchase) {
      reset({
        statusId: String(purchase.statusId),
        trackingNumber: purchase.trackingNumber ?? '',
        deliveredAt: toLocalInputValue(purchase.deliveredAt),
        newRemark: '',
      });
    }
  }, [open, purchase, reset]);

  const statusesQuery = useQuery({
    queryKey: ['rewardMallPurchaseStatus'],
    queryFn: () => rewardMallPurchaseStatusService.list(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      rewardMallPurchasesService.update(purchase!.id, {
        statusId: Number(values.statusId),
        trackingNumber: values.trackingNumber || undefined,
        deliveredAt: values.deliveredAt ? new Date(values.deliveredAt).toISOString() : undefined,
        adminRemark: values.newRemark.trim() ? [values.newRemark.trim()] : undefined,
      }),
    onSuccess: () => {
      toast.success('Purchase updated.');
      queryClient.invalidateQueries({ queryKey: ['rewardMallPurchases'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Update Redemption #${purchase?.id ?? ''}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={mutation.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Select
          label="Status"
          options={(statusesQuery.data ?? []).map((s) => ({ value: String(s.id), label: s.name }))}
          {...register('statusId')}
        />
        <Input label="Tracking Number" {...register('trackingNumber')} />
        <Input label="Delivered At" type="datetime-local" {...register('deliveredAt')} />
        <Textarea
          label="Add Remark"
          hint="Appended to the existing remark history — does not replace it."
          placeholder="e.g. Shipped via courier"
          {...register('newRemark')}
        />
      </form>
    </Modal>
  );
}

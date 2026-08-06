import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { toApiError } from '../../services/api';
import { pointPoolDetailService } from '../../services/pointPoolDetail.service';
import { pointPoolService } from '../../services/pointPool.service';
import { POINT_POOL_STATUSES, type CreatePointPoolRequest, type PointPool } from '../../types/pointPool.types';
import { pointPoolSchema, type PointPoolFormValues } from './pointPool.schema';
import styles from './PointPools.module.scss';

export interface PointPoolFormModalProps {
  open: boolean;
  pool: PointPool | null;
  onClose: () => void;
}

// datetime-local inputs need "YYYY-MM-DDTHH:mm", ISO strings from the API
// carry seconds/timezone — trim to what the input accepts.
function toLocalInputValue(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function PointPoolFormModal({ open, pool, onClose }: PointPoolFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = pool !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PointPoolFormValues>({ resolver: zodResolver(pointPoolSchema) });

  useEffect(() => {
    if (open) {
      reset({
        poolDetailId: pool?.poolDetailId ? String(pool.poolDetailId) : '',
        fromDatetime: toLocalInputValue(pool?.fromDatetime),
        toDatetime: toLocalInputValue(pool?.toDatetime),
        totalUsers: pool?.totalUsers ?? 0,
        totalAdmins: pool?.totalAdmins ?? 0,
        totalCredit: pool?.totalCredit ?? 0,
        totalDebit: pool?.totalDebit ?? 0,
        currentBalance: pool?.currentBalance ?? 0,
        distributedPoints: pool?.distributedPoints ?? 0,
        status: pool?.status ?? 'active',
      });
    }
  }, [open, pool, reset]);

  const poolDetailsQuery = useQuery({
    queryKey: ['pointPoolDetail'],
    queryFn: () => pointPoolDetailService.list(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (values: PointPoolFormValues) => {
      const payload: CreatePointPoolRequest = {
        ...values,
        poolDetailId: Number(values.poolDetailId),
        fromDatetime: new Date(values.fromDatetime).toISOString(),
        toDatetime: new Date(values.toDatetime).toISOString(),
        status: values.status as CreatePointPoolRequest['status'],
      };
      return isEdit ? pointPoolService.update(pool!.id, payload) : pointPoolService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Pool updated.' : 'Pool created.');
      queryClient.invalidateQueries({ queryKey: ['pointPools'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Point Pool' : 'Add Point Pool'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Pool'}
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Select
          label="Pool Detail"
          required
          placeholder="Select a pool detail"
          options={(poolDetailsQuery.data ?? []).map((d) => ({ value: String(d.id), label: `${d.name} (${d.type})` }))}
          error={errors.poolDetailId?.message}
          {...register('poolDetailId')}
        />

        <div className={styles.row}>
          <Input
            label="From"
            type="datetime-local"
            required
            error={errors.fromDatetime?.message}
            {...register('fromDatetime')}
          />
          <Input
            label="To"
            type="datetime-local"
            required
            error={errors.toDatetime?.message}
            {...register('toDatetime')}
          />
        </div>

        <div className={styles.row3}>
          <Input label="Total Users" type="number" {...register('totalUsers')} />
          <Input label="Total Admins" type="number" {...register('totalAdmins')} />
          <Select
            label="Status"
            options={POINT_POOL_STATUSES.map((s) => ({ value: s, label: s }))}
            {...register('status')}
          />
        </div>

        <div className={styles.row3}>
          <Input label="Total Credit" type="number" step="0.01" {...register('totalCredit')} />
          <Input label="Total Debit" type="number" step="0.01" {...register('totalDebit')} />
          <Input label="Current Balance" type="number" step="0.01" {...register('currentBalance')} />
        </div>

        <Input label="Distributed Points" type="number" step="0.01" {...register('distributedPoints')} />
      </form>
    </Modal>
  );
}

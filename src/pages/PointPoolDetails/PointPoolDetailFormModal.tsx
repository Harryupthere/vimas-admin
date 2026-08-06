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
import { pointPoolDetailService } from '../../services/pointPoolDetail.service';
import {
  POINT_POOL_DETAIL_TYPES,
  type CreatePointPoolDetailRequest,
  type PointPoolDetail,
} from '../../types/pointPoolDetail.types';
import { pointPoolDetailSchema, type PointPoolDetailFormValues } from './pointPoolDetail.schema';
import styles from './PointPoolDetails.module.scss';

export interface PointPoolDetailFormModalProps {
  open: boolean;
  detail: PointPoolDetail | null;
  onClose: () => void;
}

export function PointPoolDetailFormModal({ open, detail, onClose }: PointPoolDetailFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = detail !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PointPoolDetailFormValues>({ resolver: zodResolver(pointPoolDetailSchema) });

  useEffect(() => {
    if (open) {
      reset({
        type: detail?.type ?? 'weekly',
        name: detail?.name ?? '',
        description: detail?.description ?? '',
        symbol: detail?.symbol ?? '',
        colour: detail?.colour ?? '#0891b2',
        status: detail?.status ?? 'active',
      });
    }
  }, [open, detail, reset]);

  const mutation = useMutation({
    mutationFn: (values: PointPoolDetailFormValues) => {
      const payload = values as CreatePointPoolDetailRequest;
      return isEdit ? pointPoolDetailService.update(detail!.id, payload) : pointPoolDetailService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Pool detail updated.' : 'Pool detail created.');
      queryClient.invalidateQueries({ queryKey: ['pointPoolDetail'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Pool Detail' : 'Add Pool Detail'}
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
        <div className={styles.row}>
          <Select
            label="Recurrence"
            required
            options={POINT_POOL_DETAIL_TYPES.map((t) => ({ value: t, label: t.replace('_', '-') }))}
            {...register('type')}
          />
          <Select
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            {...register('status')}
          />
        </div>
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
        <div className={styles.row}>
          <Input label="Symbol" error={errors.symbol?.message} {...register('symbol')} />
          <Input label="Colour" type="color" {...register('colour')} />
        </div>
      </form>
    </Modal>
  );
}

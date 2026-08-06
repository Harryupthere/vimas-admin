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
import { pointDistributionService } from '../../services/pointDistribution.service';
import {
  POINT_EVENT_TYPES,
  POINT_RECEIVER_TYPES,
  type CreatePointDistributionRequest,
  type PointDistribution,
} from '../../types/pointDistribution.types';
import { pointDistributionSchema, type PointDistributionFormValues } from './pointDistribution.schema';
import styles from './PointDistribution.module.scss';

export interface PointDistributionFormModalProps {
  open: boolean;
  rule: PointDistribution | null;
  onClose: () => void;
}

export function PointDistributionFormModal({ open, rule, onClose }: PointDistributionFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = rule !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PointDistributionFormValues>({ resolver: zodResolver(pointDistributionSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: rule?.name ?? '',
        description: rule?.description ?? '',
        symbol: rule?.symbol ?? '',
        colour: rule?.colour ?? '#4F46E5',
        eventType: rule?.eventType ?? 'BUY_PRODUCT',
        receiverType: rule?.receiverType ?? 'BUYER',
        pointsPercentage: rule?.pointsPercentage ?? 0,
        priority: rule?.priority ?? 1,
        status: rule?.status ?? 'active',
      });
    }
  }, [open, rule, reset]);

  const mutation = useMutation({
    mutationFn: (values: PointDistributionFormValues) => {
      const payload = values as CreatePointDistributionRequest;
      return isEdit ? pointDistributionService.update(rule!.id, payload) : pointDistributionService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Rule updated.' : 'Rule created.');
      queryClient.invalidateQueries({ queryKey: ['pointDistribution'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Distribution Rule' : 'Add Distribution Rule'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Rule'}
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />

        <div className={styles.row}>
          <Select
            label="Event Type"
            required
            options={POINT_EVENT_TYPES.map((t) => ({ value: t, label: t }))}
            error={errors.eventType?.message}
            {...register('eventType')}
          />
          <Select
            label="Receiver Type"
            required
            options={POINT_RECEIVER_TYPES.map((t) => ({ value: t, label: t }))}
            error={errors.receiverType?.message}
            {...register('receiverType')}
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Points Percentage"
            type="number"
            step="0.01"
            hint="Share (0-100) of the product's total points this receiver gets."
            required
            error={errors.pointsPercentage?.message}
            {...register('pointsPercentage')}
          />
          <Input label="Priority" type="number" error={errors.priority?.message} {...register('priority')} />
        </div>

        <div className={styles.row}>
          <Input label="Symbol" error={errors.symbol?.message} {...register('symbol')} />
          <Select
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            {...register('status')}
          />
        </div>
      </form>
    </Modal>
  );
}

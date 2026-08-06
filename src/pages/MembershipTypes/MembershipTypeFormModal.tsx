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
import { membershipTypesService } from '../../services/membershipTypes.service';
import type { MembershipType } from '../../types/membershipType.types';
import { membershipTypeSchema, type MembershipTypeFormValues } from './membershipType.schema';
import styles from './MembershipTypes.module.scss';

export interface MembershipTypeFormModalProps {
  open: boolean;
  membershipType: MembershipType | null;
  onClose: () => void;
}

export function MembershipTypeFormModal({ open, membershipType, onClose }: MembershipTypeFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = membershipType !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MembershipTypeFormValues>({ resolver: zodResolver(membershipTypeSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: membershipType?.name ?? '',
        description: membershipType?.description ?? '',
        icon: membershipType?.icon ?? '',
        key_points: membershipType?.key_points?.join('\n') ?? '',
        colour: membershipType?.colour ?? '#FFD700',
        points_required: membershipType?.points_required ?? 0,
      });
    }
  }, [open, membershipType, reset]);

  const mutation = useMutation({
    mutationFn: (values: MembershipTypeFormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        icon: values.icon || undefined,
        key_points: values.key_points
          ? values.key_points.split('\n').map((l) => l.trim()).filter(Boolean)
          : undefined,
        colour: values.colour || undefined,
        points_required: values.points_required,
      };
      return isEdit
        ? membershipTypesService.update(membershipType!.id, payload)
        : membershipTypesService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Membership type updated.' : 'Membership type created.');
      queryClient.invalidateQueries({ queryKey: ['membershipTypes'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Membership Type' : 'Add Membership Type'}
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
          <Input label="Colour" type="color" {...register('colour')} />
        </div>
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
        <div className={styles.row}>
          <Input label="Icon URL" error={errors.icon?.message} {...register('icon')} />
          <Input
            label="Points Required"
            type="number"
            error={errors.points_required?.message}
            {...register('points_required')}
          />
        </div>
        <Textarea label="Key Points" hint="One per line." error={errors.key_points?.message} {...register('key_points')} />
      </form>
    </Modal>
  );
}

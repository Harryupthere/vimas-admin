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
import { registrationTypesService } from '../../services/registrationTypes.service';
import type { RegistrationType } from '../../types/registrationType.types';
import { registrationTypeSchema, type RegistrationTypeFormValues } from './registrationType.schema';
import styles from './RegistrationTypes.module.scss';

export interface RegistrationTypeFormModalProps {
  open: boolean;
  registrationType: RegistrationType | null;
  onClose: () => void;
}

export function RegistrationTypeFormModal({ open, registrationType, onClose }: RegistrationTypeFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = registrationType !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationTypeFormValues>({ resolver: zodResolver(registrationTypeSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: registrationType?.name ?? '',
        description: registrationType?.description ?? '',
        status: registrationType?.status ?? 1,
      });
    }
  }, [open, registrationType, reset]);

  const mutation = useMutation({
    mutationFn: async (values: RegistrationTypeFormValues) => {
      if (isEdit) {
        await registrationTypesService.update(registrationType!.id, values);
      } else {
        await registrationTypesService.create(values);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Registration type updated.' : 'Registration type created.');
      queryClient.invalidateQueries({ queryKey: ['registrationTypes'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Registration Type' : 'Add Registration Type'}
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
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
        <Select
          label="Status"
          options={[
            { value: '1', label: 'Active' },
            { value: '0', label: 'Inactive' },
          ]}
          {...register('status')}
        />
      </form>
    </Modal>
  );
}

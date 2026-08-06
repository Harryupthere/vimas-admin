import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { toApiError } from '../../services/api';
import { orderStatusService } from '../../services/orderStatus.service';
import { ordersService } from '../../services/orders.service';
import { paymentStatusService } from '../../services/paymentStatus.service';
import type { Order } from '../../types/order.types';
import styles from './Orders.module.scss';

export interface UpdateOrderStatusModalProps {
  order: Order | null;
  onClose: () => void;
}

interface FormValues {
  orderStatusId: string;
  paymentStatusId: string;
}

export function UpdateOrderStatusModal({ order, onClose }: UpdateOrderStatusModalProps) {
  const queryClient = useQueryClient();
  const open = order !== null;

  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (open && order) {
      reset({ orderStatusId: String(order.orderStatusId), paymentStatusId: String(order.paymentStatusId) });
    }
  }, [open, order, reset]);

  const orderStatusesQuery = useQuery({
    queryKey: ['orderStatus'],
    queryFn: () => orderStatusService.list(),
    enabled: open,
  });

  const paymentStatusesQuery = useQuery({
    queryKey: ['paymentStatus'],
    queryFn: () => paymentStatusService.list(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      ordersService.updateStatus(order!.id, {
        orderStatusId: Number(values.orderStatusId),
        paymentStatusId: Number(values.paymentStatusId),
      }),
    onSuccess: () => {
      toast.success('Order status updated.');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Update Order #${order?.id ?? ''}`}
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
          label="Order Status"
          options={(orderStatusesQuery.data ?? []).map((s) => ({ value: String(s.id), label: s.name }))}
          {...register('orderStatusId')}
        />
        <Select
          label="Payment Status"
          options={(paymentStatusesQuery.data ?? []).map((s) => ({ value: String(s.id), label: s.name }))}
          {...register('paymentStatusId')}
        />
      </form>
    </Modal>
  );
}

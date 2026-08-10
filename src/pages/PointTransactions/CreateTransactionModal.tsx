import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select, type SelectOption } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { toApiError } from '../../services/api';
import { ordersService } from '../../services/orders.service';
import { pointDistributionService } from '../../services/pointDistribution.service';
import { pointPoolService } from '../../services/pointPool.service';
import { pointTransactionsService } from '../../services/pointTransactions.service';
import { pointAdminBalanceService, pointUserBalanceService } from '../../services/pointWallets.service';
import { productsService } from '../../services/products.service';
import { usersService } from '../../services/users.service';
import { POINT_TRANSACTION_REASONS, POINT_TRANSACTION_TYPES, POINT_WALLET_TYPES } from '../../types/point.types';
import type { CreatePointTransactionRequest } from '../../types/point.types';
import type { User } from '../../types/user.types';
import { createPointTransactionSchema, type CreatePointTransactionFormValues } from './pointTransaction.schema';
import styles from './PointTransactions.module.scss';

export interface CreateTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

function formatUserLabel(user: User): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  const identity = user.email || user.username || user.unique_user_id || `User #${user.id}`;
  return fullName ? `${fullName} (${identity})` : identity;
}

export function CreateTransactionModal({ open, onClose }: CreateTransactionModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePointTransactionFormValues>({ resolver: zodResolver(createPointTransactionSchema) });

  const walletType = watch('walletType');

  // Wallet options are sourced from the actual wallet tables, not the
  // owner tables — walletId is a loose reference (no FK on the entity)
  // whose meaning depends on walletType: point_user_balances.id for USER,
  // point_admin_balances.id for ADMIN, point_pools.id for POOL.
  const userBalancesQuery = useQuery({
    queryKey: ['pointUserBalances', 'all'],
    queryFn: () => pointUserBalanceService.list({ page: 1, limit: 100 }),
    enabled: open,
  });
  const adminBalancesQuery = useQuery({
    queryKey: ['pointAdminBalances', 'all'],
    queryFn: () => pointAdminBalanceService.list({ page: 1, limit: 100 }),
    enabled: open,
  });
  const poolsQuery = useQuery({
    queryKey: ['pointPools', 'all'],
    queryFn: () => pointPoolService.list({ page: 1, limit: 100 }),
    enabled: open,
  });

  const usersQuery = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => usersService.list({ page: 1, limit: 100 }),
    enabled: open,
  });
  const productsQuery = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.list({ page: 1, limit: 100 }),
    enabled: open,
  });
  const ordersQuery = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => ordersService.list({ page: 1, limit: 100 }),
    enabled: open,
  });
  const pointDistributionQuery = useQuery({
    queryKey: ['pointDistribution', 'all'],
    queryFn: () => pointDistributionService.list(),
    enabled: open,
  });

  // Reset the wallet selection whenever the wallet type changes — a
  // point_user_balances id has no meaning once walletType flips to ADMIN.
  useEffect(() => {
    setValue('walletId', '');
  }, [walletType, setValue]);

  const walletOptions: SelectOption[] =
    walletType === 'ADMIN'
      ? (adminBalancesQuery.data?.items ?? []).map((b) => ({
          value: String(b.id),
          label: `${b.admin?.username ?? `Admin #${b.adminId}`} — Balance: ${b.currentBalance}`,
        }))
      : walletType === 'POOL'
        ? (poolsQuery.data?.items ?? []).map((p) => ({
            value: String(p.id),
            label: `${p.poolDetail?.name ?? `Pool #${p.id}`} — Balance: ${p.currentBalance}`,
          }))
        : (userBalancesQuery.data?.items ?? []).map((b) => ({
            value: String(b.id),
            label: `${b.user?.username ?? b.user?.email ?? `User #${b.userId}`} — Balance: ${b.currentBalance}`,
          }));

  const mutation = useMutation({
    mutationFn: (values: CreatePointTransactionFormValues) => {
      const payload: CreatePointTransactionRequest = {
        walletType: values.walletType as CreatePointTransactionRequest['walletType'],
        walletId: Number(values.walletId),
        transactionType: values.transactionType as CreatePointTransactionRequest['transactionType'],
        transactionReason: values.transactionReason as CreatePointTransactionRequest['transactionReason'],
        sourceUserId: values.sourceUserId ? Number(values.sourceUserId) : undefined,
        sourceAdminId: values.sourceAdminId ? Number(values.sourceAdminId) : undefined,
        productId: values.productId ? Number(values.productId) : undefined,
        orderId: values.orderId ? Number(values.orderId) : undefined,
        pointDistributionId: values.pointDistributionId ? Number(values.pointDistributionId) : undefined,
        poolId: values.poolId ? Number(values.poolId) : undefined,
        amount: values.amount,
        remarks: values.remarks || undefined,
      };
      return pointTransactionsService.create(payload);
    },
    onSuccess: () => {
      toast.success('Transaction created.');
      queryClient.invalidateQueries({ queryKey: ['pointTransactions'] });
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
      title="Add Point Transaction"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((v) => mutation.mutate(v))} loading={isSubmitting}>
            Create Transaction
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <div className={styles.row}>
          <Select
            label="Wallet Type"
            required
            options={POINT_WALLET_TYPES.map((t) => ({ value: t, label: t }))}
            {...register('walletType')}
          />
          <Select
            label="Wallet"
            required
            placeholder="Select a wallet"
            hint="Sourced from the point-user-balance / point-admin-balance / point-pool tables."
            options={walletOptions}
            error={errors.walletId?.message}
            {...register('walletId')}
          />
        </div>

        <div className={styles.row}>
          <Select
            label="Transaction Type"
            required
            options={POINT_TRANSACTION_TYPES.map((t) => ({ value: t, label: t }))}
            {...register('transactionType')}
          />
          <Select
            label="Reason"
            required
            options={POINT_TRANSACTION_REASONS.map((t) => ({ value: t, label: t }))}
            {...register('transactionReason')}
          />
        </div>

        <Input label="Amount" type="number" step="0.01" required error={errors.amount?.message} {...register('amount')} />

        <div className={styles.row3}>
          <Select
            label="Source User"
            placeholder="None"
            options={(usersQuery.data?.items ?? []).map((u) => ({ value: String(u.id), label: formatUserLabel(u) }))}
            {...register('sourceUserId')}
          />
          <Select
            label="Source Admin"
            placeholder="None"
            hint="Only admins with a point-admin-balance row appear here."
            options={(adminBalancesQuery.data?.items ?? []).map((b) => ({
              value: String(b.adminId),
              label: b.admin?.username ?? `Admin #${b.adminId}`,
            }))}
            {...register('sourceAdminId')}
          />
          <Select
            label="Product"
            placeholder="None"
            options={(productsQuery.data?.items ?? []).map((p) => ({ value: String(p.id), label: p.name }))}
            {...register('productId')}
          />
        </div>

        <div className={styles.row3}>
          <Select
            label="Order"
            placeholder="None"
            options={(ordersQuery.data?.items ?? []).map((o) => ({ value: String(o.id), label: `Order #${o.id}` }))}
            {...register('orderId')}
          />
          <Select
            label="Distribution Rule"
            placeholder="None"
            options={(pointDistributionQuery.data ?? []).map((d) => ({ value: String(d.id), label: d.name }))}
            {...register('pointDistributionId')}
          />
          <Select
            label="Pool"
            placeholder="None"
            options={(poolsQuery.data?.items ?? []).map((p) => ({
              value: String(p.id),
              label: p.poolDetail?.name ?? `Pool #${p.id}`,
            }))}
            {...register('poolId')}
          />
        </div>

        <Textarea label="Remarks" error={errors.remarks?.message} {...register('remarks')} />
      </form>
    </Modal>
  );
}

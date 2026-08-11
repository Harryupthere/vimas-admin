import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { toApiError } from '../../services/api';
import { paymentOptionsService } from '../../services/paymentOptions.service';
import { productPaymentOptionsService } from '../../services/productPaymentOptions.service';
import { productsService } from '../../services/products.service';
import { formatCurrency } from '../../utils/formatters';
import styles from './Products.module.scss';

export interface ProductPaymentOptionsModalProps {
  productId: number | null;
  onClose: () => void;
}

// There's still no admin GET-by-product/list endpoint for this mapping —
// see productPaymentOption.types.ts. Mapped options only ever arrive
// embedded in the product's own `paymentOptions` relation, so this modal
// re-fetches the product itself after every add/remove (same pattern as
// the Media modal).
export function ProductPaymentOptionsModal({ productId, onClose }: ProductPaymentOptionsModalProps) {
  const queryClient = useQueryClient();
  const open = productId !== null;
  const [selectedOptionId, setSelectedOptionId] = useState('');

  const productQuery = useQuery({
    queryKey: ['products', 'detail', productId],
    queryFn: () => productsService.getById(productId as number),
    enabled: open,
  });

  const paymentOptionsQuery = useQuery({
    queryKey: ['paymentOptions', 'all'],
    queryFn: () => paymentOptionsService.list({ status: 1 }),
    enabled: open,
  });

  const mappedOptionIds = useMemo(
    () => new Set((productQuery.data?.paymentOptions ?? []).map((m) => m.payment_option_id)),
    [productQuery.data],
  );

  const availableOptions = (paymentOptionsQuery.data ?? []).filter((o) => !mappedOptionIds.has(o.id));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['products', 'detail', productId] });

  const addMutation = useMutation({
    mutationFn: () =>
      productPaymentOptionsService.create({
        product_id: productId as number,
        payment_option_id: Number(selectedOptionId),
      }),
    onSuccess: () => {
      toast.success('Payment option mapped to product.');
      invalidate();
      setSelectedOptionId('');
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  // `id` here is the product_payment_options row's own id (the mapping),
  // not payment_option_id — see productPaymentOption.types.ts.
  const removeMutation = useMutation({
    mutationFn: (id: number) => productPaymentOptionsService.remove(id),
    onSuccess: () => {
      toast.success('Payment option unmapped from product.');
      invalidate();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const handleClose = () => {
    setSelectedOptionId('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Manage Payment Options" size="sm">
      {productQuery.isLoading ? (
        <Loader />
      ) : (
        <>
          {(productQuery.data?.paymentOptions ?? []).length === 0 ? (
            <EmptyState title="No payment options mapped yet" />
          ) : (
            <div className={styles.mappedList}>
              {(productQuery.data?.paymentOptions ?? []).map((mapping) => (
                <div key={mapping.id} className={styles.mappedItem}>
                  <div>
                    <span className={styles.mappedItemName}>{mapping.paymentOption?.name ?? `#${mapping.payment_option_id}`}</span>
                    {mapping.paymentOption && (
                      <span className={styles.mappedItemCharges}> — {formatCurrency(mapping.paymentOption.charges)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.mappedItemRemove}
                    onClick={() => removeMutation.mutate(mapping.id)}
                    disabled={removeMutation.isPending}
                    aria-label={`Unmap ${mapping.paymentOption?.name ?? 'payment option'}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.addMappingRow}>
            <div className={styles.addMappingSelect}>
              <Select
                placeholder={availableOptions.length === 0 ? 'All active options already mapped' : 'Select a payment option'}
                options={availableOptions.map((o) => ({ value: String(o.id), label: o.name }))}
                value={selectedOptionId}
                disabled={availableOptions.length === 0}
                onChange={(e) => setSelectedOptionId(e.target.value)}
              />
            </div>
            <Button
              onClick={() => addMutation.mutate()}
              loading={addMutation.isPending}
              disabled={!selectedOptionId}
            >
              Add
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { ordersService } from '../../services/orders.service';
import type { BuyerContactDetails } from '../../types/order.types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import styles from './Orders.module.scss';

export interface OrderDetailModalProps {
  orderId: number | null;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['orders', 'detail', orderId],
    queryFn: () => ordersService.getById(orderId as number),
    enabled: orderId !== null,
  });

  return (
    <Modal open={orderId !== null} onClose={onClose} title={`Order #${orderId ?? ''}`} size="md">
      {isLoading || !order ? (
        <Loader />
      ) : (
        <dl className={styles.detailGrid}>
          <Field label="Product" value={order.product?.name ?? `#${order.productId}`} />
          <Field label="Product Type" value={order.productType} />
          <Field
            label="Buyer"
            value={order.buyer?.username ?? order.buyer?.email ?? `User #${order.buyerId}`}
          />
          <Field label="Quantity" value={String(order.quantity)} />
          <Field label="Unit Price" value={formatCurrency(order.singleUnitPrice)} />
          <Field label="Total Amount" value={formatCurrency(order.totalAmount)} />
          <Field label="Amount Paid" value={formatCurrency(order.totalAmountPaid)} />
          <Field label="Order Status" value={order.orderStatus?.name ?? '—'} />
          <Field label="Payment Status" value={order.paymentStatus?.name ?? '—'} />
          <Field label="Placed" value={formatDateTime(order.createdAt)} />
          <Field label="Last Updated" value={formatDateTime(order.lastUpdate)} />

          {order.buyerContactDetails && (
            <>
              <h4 className={styles.sectionTitle}>Contact &amp; Shipping Address</h4>
              <Field label="Phone" value={formatPhone(order.buyerContactDetails)} />
              <Field label="Address" value={formatAddress(order.buyerContactDetails)} />
            </>
          )}
        </dl>
      )}
    </Modal>
  );
}

function formatPhone({ countryCode, phoneNumber }: BuyerContactDetails) {
  if (!phoneNumber) return '—';
  return countryCode ? `${countryCode} ${phoneNumber}` : phoneNumber;
}

function formatAddress(details: BuyerContactDetails) {
  const parts = [details.address1, details.address2, details.landmark, details.state, details.country].filter(
    (part): part is string => Boolean(part && part.trim()),
  );
  return parts.length > 0 ? parts.join(', ') : '—';
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.field}>
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue}>{value}</dd>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { rewardMallPurchasesService } from '../../services/rewardMallPurchases.service';
import { formatDateTime } from '../../utils/formatters';
import styles from './RewardMallPurchases.module.scss';

export interface PurchaseDetailModalProps {
  purchaseId: number | null;
  onClose: () => void;
}

export function PurchaseDetailModal({ purchaseId, onClose }: PurchaseDetailModalProps) {
  const { data: purchase, isLoading } = useQuery({
    queryKey: ['rewardMallPurchases', 'detail', purchaseId],
    queryFn: () => rewardMallPurchasesService.getById(purchaseId as number),
    enabled: purchaseId !== null,
  });

  return (
    <Modal open={purchaseId !== null} onClose={onClose} title={`Redemption #${purchaseId ?? ''}`} size="md">
      {isLoading || !purchase ? (
        <Loader />
      ) : (
        <>
          <dl className={styles.detailGrid}>
            <Field label="Product" value={purchase.product?.name ?? `#${purchase.rewardMallProductId}`} />
            <Field label="Buyer" value={purchase.user?.username ?? purchase.user?.email ?? `User #${purchase.userId}`} />
            <Field label="Quantity" value={String(purchase.quantity)} />
            <Field label="Points Redeemed" value={`${purchase.pointsRedeemed} pts`} />
            <Field label="Status" value={purchase.status?.name ?? '—'} />
            <Field label="Tracking Number" value={purchase.trackingNumber ?? '—'} />
            <Field label="Redeemed" value={formatDateTime(purchase.createdAt)} />
            <Field label="Delivered" value={formatDateTime(purchase.deliveredAt)} />
          </dl>

          {purchase.userRemark && purchase.userRemark.length > 0 && (
            <>
              <p className={[styles.fieldLabel, styles.subheading].join(' ')}>
                Buyer Remarks
              </p>
              <ul className={styles.remarkList}>
                {purchase.userRemark.map((remark, i) => (
                  <li key={i}>{remark}</li>
                ))}
              </ul>
            </>
          )}

          {purchase.adminRemark && purchase.adminRemark.length > 0 && (
            <>
              <p className={[styles.fieldLabel, styles.subheading].join(' ')}>
                Admin Remarks
              </p>
              <ul className={styles.remarkList}>
                {purchase.adminRemark.map((remark, i) => (
                  <li key={i}>{remark}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </Modal>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.field}>
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue}>{value}</dd>
    </div>
  );
}

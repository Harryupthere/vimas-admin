import { Modal } from '../../components/Modal';
import type { ProductHistory } from '../../types/productHistory.types';
import styles from './ProductHistory.module.scss';

export interface HistoryDetailModalProps {
  entry: ProductHistory | null;
  onClose: () => void;
}

export function HistoryDetailModal({ entry, onClose }: HistoryDetailModalProps) {
  return (
    <Modal open={entry !== null} onClose={onClose} title={`History Entry #${entry?.id ?? ''}`} size="lg">
      {entry && (
        <div className={styles.diffGrid}>
          <div className={styles.diffCol}>
            <h4>Old Values</h4>
            <pre className={styles.diffPre}>{JSON.stringify(entry.oldValues, null, 2) ?? '—'}</pre>
          </div>
          <div className={styles.diffCol}>
            <h4>New Values</h4>
            <pre className={styles.diffPre}>{JSON.stringify(entry.newValues, null, 2) ?? '—'}</pre>
          </div>
        </div>
      )}
    </Modal>
  );
}

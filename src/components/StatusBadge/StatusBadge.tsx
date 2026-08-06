import styles from './StatusBadge.module.scss';

export type StatusBadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  label: string;
  tone: StatusBadgeTone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={[styles.badge, styles[tone]].join(' ')}>{label}</span>;
}

/** Most admin tables use the same 0/1 active-inactive convention
 *  (users.status, product-feedback status excepted) — this maps it once. */
export function statusToneFromFlag(flag: number | boolean): StatusBadgeTone {
  return flag ? 'success' : 'neutral';
}

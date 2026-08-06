import type { ReactNode } from 'react';
import { Loader } from '../Loader';
import styles from './StatCard.module.scss';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  loading?: boolean;
  placeholder?: boolean;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
}

export function StatCard({ label, value, icon, loading, placeholder, trend }: StatCardProps) {
  return (
    <div className={[styles.card, placeholder ? styles.placeholder : ''].filter(Boolean).join(' ')}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>

      {loading ? (
        <Loader size="sm" />
      ) : placeholder ? (
        <span className={styles.placeholderText}>Coming soon</span>
      ) : (
        <span className={styles.value}>{value}</span>
      )}

      {trend && !loading && !placeholder && (
        <span className={[styles.trend, styles[trend.direction]].join(' ')}>{trend.value}</span>
      )}
    </div>
  );
}

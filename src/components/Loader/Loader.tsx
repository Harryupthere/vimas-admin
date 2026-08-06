import styles from './Loader.module.scss';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  label?: string;
}

export function Loader({ size = 'md', fullPage = false, label }: LoaderProps) {
  const spinner = (
    <div className={styles.wrap}>
      <span className={[styles.spinner, styles[size]].join(' ')} aria-hidden="true" />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className={styles.fullPage}>{spinner}</div>;
  }

  return spinner;
}

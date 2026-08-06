import styles from './Footer.module.scss';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} VimasGV. All rights reserved.</span>
    </footer>
  );
}

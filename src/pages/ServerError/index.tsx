import { Button } from '../../components/Button';
import styles from '../ErrorPage.module.scss';

export default function ServerErrorPage() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>500</span>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.description}>An unexpected server error occurred. Please try again.</p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  );
}

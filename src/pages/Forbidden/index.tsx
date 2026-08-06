import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import styles from '../ErrorPage.module.scss';

export default function ForbiddenPage() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>403</span>
      <h1 className={styles.title}>Access denied</h1>
      <p className={styles.description}>You don't have permission to view this page.</p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import styles from '../ErrorPage.module.scss';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.description}>The page you're looking for doesn't exist or was moved.</p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}

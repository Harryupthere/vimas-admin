import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { toApiError } from '../../services/api';
import { authService } from '../../services/auth.service';
import { changePasswordSchema, type ChangePasswordFormValues } from './changePassword.schema';
import styles from './Profile.module.scss';

export default function ProfilePage() {
  const { admin } = useAuth();
  const displayName = admin?.username || 'Admin';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await authService.changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword });
      toast.success('Password changed successfully.');
      reset();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" description="Your account details and security settings." />

      <div className={styles.grid}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Account</h3>
          <div className={styles.identity}>
            <Avatar name={displayName} size="lg" />
            <div>
              <p className={styles.name}>{displayName}</p>
              <p className={styles.email}>Administrator</p>
            </div>
          </div>
          {/* No GET /admin/profile endpoint exists, and the admins table itself
              has no name/email column — this is the identity
              captured from the login response, cached locally. */}
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Change Password</h3>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
            <Input
              label="Current Password"
              type="password"
              autoComplete="current-password"
              error={errors.oldPassword?.message}
              {...register('oldPassword')}
            />
            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" loading={isSubmitting}>
              Update Password
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

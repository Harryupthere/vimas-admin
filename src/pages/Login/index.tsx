import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../hooks/useAuth';
import { toApiError } from '../../services/api';
import { loginSchema, type LoginFormValues } from './login.schema';
import styles from './Login.module.scss';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    try {
      await login(values);
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setSubmitError(toApiError(err).message || 'Invalid username or password.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>VG</div>
          <div>
            <h1 className={styles.brandName}>VimasGV</h1>
            <p className={styles.brandTag}>Admin Panel</p>
          </div>
        </div>

        <h2 className={styles.title}>Sign in</h2>
        <p className={styles.subtitle}>Enter your credentials to access the admin panel.</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <Input
            label="Username or Email"
            type="text"
            autoComplete="username"
            placeholder="admin@vimas.com"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {submitError && <div className={styles.formError}>{submitError}</div>}

          <Button type="submit" fullWidth loading={isSubmitting}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

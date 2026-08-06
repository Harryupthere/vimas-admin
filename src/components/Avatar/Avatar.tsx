import styles from './Avatar.module.scss';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return initials.join('') || '?';
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const classes = [styles.avatar, styles[size]].join(' ');

  if (src) {
    return <img className={classes} src={src} alt={name || 'avatar'} />;
  }

  return (
    <span className={classes} aria-hidden="true">
      {getInitials(name)}
    </span>
  );
}

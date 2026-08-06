import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/Avatar';
import { Dropdown } from '../../components/Dropdown';
import { useAuth } from '../../hooks/useAuth';
import { KeyIcon, LogoutIcon, MenuIcon, UserCircleIcon } from './icons';
import styles from './Topbar.module.scss';

export interface TopbarProps {
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;
}

export function Topbar({ onToggleSidebar, onToggleMobileSidebar }: TopbarProps) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = admin?.username || 'Admin';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>
        <button
          type="button"
          className={[styles.iconBtn, styles.mobileOnly].join(' ')}
          onClick={onToggleMobileSidebar}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </div>

      <div className={styles.right}>
        <Dropdown
          align="right"
          trigger={
            <span className={styles.userTrigger}>
              <Avatar name={displayName} size="sm" />
              <span className={styles.userName}>{displayName}</span>
            </span>
          }
          items={[
            { label: 'Profile', icon: <UserCircleIcon width={16} height={16} />, onClick: () => navigate('/profile') },
            {
              label: 'Change Password',
              icon: <KeyIcon width={16} height={16} />,
              onClick: () => navigate('/profile?tab=password'),
            },
            { label: 'Logout', icon: <LogoutIcon width={16} height={16} />, onClick: logout, danger: true },
          ]}
        />
      </div>
    </header>
  );
}

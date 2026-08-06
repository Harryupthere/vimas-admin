import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import styles from './AdminLayout.module.scss';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div
        className={[styles.main, collapsed ? styles.mainCollapsed : ''].filter(Boolean).join(' ')}
      >
        <Topbar
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onToggleMobileSidebar={() => setMobileOpen((v) => !v)}
        />
        <div className={styles.content}>
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}

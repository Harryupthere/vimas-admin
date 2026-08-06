import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../routes/navConfig';
import { ChevronDownIcon } from './icons';
import styles from './Sidebar.module.scss';

export interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Auto-expand the group that contains the current route.
  useEffect(() => {
    const activeGroup = NAV_ITEMS.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.path)),
    );
    if (activeGroup) {
      setOpenGroups((prev) => ({ ...prev, [activeGroup.label]: true }));
    }
  }, [location.pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      {mobileOpen && <div className={styles.backdrop} onClick={onCloseMobile} />}
      <aside
        className={[styles.sidebar, collapsed ? styles.collapsed : '', mobileOpen ? styles.mobileOpen : '']
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles.brand}>
          <div className={styles.logoMark}>VG</div>
          {!collapsed && <span className={styles.brandName}>VimasGV</span>}
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isOpen = !!openGroups[item.label];
              const isChildActive = item.children.some((c) => location.pathname.startsWith(c.path));
              return (
                <div key={item.label} className={styles.group}>
                  <button
                    type="button"
                    className={[styles.groupHeader, isChildActive ? styles.active : ''].filter(Boolean).join(' ')}
                    onClick={() => toggleGroup(item.label)}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={styles.icon} />
                    {!collapsed && <span className={styles.label}>{item.label}</span>}
                    {!collapsed && (
                      <ChevronDownIcon className={[styles.chevron, isOpen ? styles.chevronOpen : ''].join(' ')} />
                    )}
                  </button>
                  {!collapsed && isOpen && (
                    <div className={styles.children}>
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            [styles.childLink, isActive ? styles.active : ''].filter(Boolean).join(' ')
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path!}
                className={({ isActive }) => [styles.link, isActive ? styles.active : ''].filter(Boolean).join(' ')}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={styles.icon} />
                {!collapsed && (
                  <span className={styles.label}>
                    {item.label}
                    {item.placeholder && <span className={styles.badge}>Soon</span>}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

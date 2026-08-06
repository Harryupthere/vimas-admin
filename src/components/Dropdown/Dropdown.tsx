import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './Dropdown.module.scss';

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.wrap} ref={ref}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((v) => !v)}>
        {trigger}
      </button>
      {open && (
        <div className={[styles.menu, styles[align]].join(' ')}>
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              className={[styles.item, item.danger ? styles.danger : ''].filter(Boolean).join(' ')}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

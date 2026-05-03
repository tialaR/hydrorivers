import type { ReactNode } from 'react';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './tooltip.module.scss';

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className={styles.wrap}>
      {children}
      <span className={styles.icon} tabIndex={0} aria-label={label}>
        <HydroIcon name="info" size={13} />
      </span>
      <span className={styles.bubble} role="tooltip">{label}</span>
    </span>
  );
}

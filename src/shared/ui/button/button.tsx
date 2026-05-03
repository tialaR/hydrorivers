import type { ReactNode } from 'react';
import styles from './button.module.scss';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  loadingLabel?: ReactNode;
};

export function Button({ className = '', variant = 'primary', loading = false, loadingLabel, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${loading ? styles.loading : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className={styles.loadingContent}>
          <span className={styles.spinner} aria-hidden="true" />
          <span>{loadingLabel ?? children}</span>
        </span>
      ) : children}
    </button>
  );
}

import styles from './badge.module.scss';

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'river' }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}

import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './breadcrumb.module.scss';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export async function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const t = await getTranslations('common');

  return (
    <nav className={styles.breadcrumb} aria-label={t('breadcrumb')}>
      <Link href="/" className={styles.home} aria-label={t('breadcrumbHome')}>
        <HydroIcon name="dock" size={16} />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span className={styles.item} key={`${item.label}-${index}`}>
            <HydroIcon name="route" size={13} />
            {item.href && !isLast ? <Link href={item.href}>{item.label}</Link> : <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>}
          </span>
        );
      })}
    </nav>
  );
}

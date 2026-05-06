import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from './breadcrumb.module.scss';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

/** `locale` is required so next-intl `Link` prefixes hrefs correctly in Server Components (avoids falling back to defaultLocale for generated URLs). */
export async function Breadcrumb({ items, locale }: { items: BreadcrumbItem[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <nav className={styles.breadcrumb} aria-label={t('breadcrumb')}>
      <Link locale={locale} href={intlAppPaths.home} className={styles.home} aria-label={t('breadcrumbHome')}>
        <HydroIcon name="dock" size={16} />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span className={styles.item} key={`${item.label}-${index}`}>
            <HydroIcon name="route" size={13} />
            {item.href && !isLast ? (
              <Link locale={locale} href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

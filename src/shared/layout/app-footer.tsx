import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { FooterSocials } from './footer-socials';
import styles from './app-footer.module.scss';

const columns = [
  {
    key: 'product',
    links: [
      [intlAppPaths.cargos.marketplace, 'cargoes'],
      [intlAppPaths.vessels.marketplace, 'vessels'],
      [intlAppPaths.negotiations.home, 'negotiations'],
      [intlAppPaths.tracking.home, 'tracking']
    ]
  },
  {
    key: 'platform',
    links: [
      [intlAppPaths.dashboard.home, 'dashboard'],
      [intlAppPaths.impact.home, 'impact'],
      [intlAppPaths.admin.home, 'admin'],
      [intlAppPaths.cargos.publishCargo, 'publish']
    ]
  },
  {
    key: 'support',
    links: [
      [intlAppPaths.auth.login, 'login'],
      [intlAppPaths.auth.register, 'signup'],
      [intlAppPaths.auth.profile, 'profile'],
      [intlAppPaths.tracking.home, 'tracking']
    ]
  },
  {
    key: 'company',
    links: [
      [intlAppPaths.impact.impactDetail('brdomar'), 'brdomar'],
      [intlAppPaths.impact.impactDetail('sustainability'), 'sustainability'],
      [intlAppPaths.impact.impactDetail('regional'), 'regional'],
      [intlAppPaths.impact.impactDetail('automation'), 'automation']
    ]
  }
] as const;

export async function AppFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'layout.footer' });
  const nav = await getTranslations({ locale, namespace: 'nav' });
  const impact = await getTranslations({ locale, namespace: 'impactCards' });
  const impactLabels = ['brdomar', 'sustainability', 'regional', 'automation'] as const;
  const getLabel = (label: string) => {
    if ((impactLabels as readonly string[]).includes(label)) return impact(`${label}.title` as never);
    return nav(label as never);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <div className={styles.logo}><span className={styles.mark}><HydroIcon name="river" size={20} /></span>HydroRivers</div>
          <p>{t('description')}</p>
        </div>
        {columns.map((column) => (
          <nav key={column.key} className={styles.column} aria-label={t(`${column.key}.title` as never)}>
            <h2>{t(`${column.key}.title` as never)}</h2>
            {column.links.map(([href, label]) => (
              <Link key={href} locale={locale} href={href}>
                {getLabel(label)}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className={styles.bottom}>
        <span>{t('copyrightLine')}</span>
        <FooterSocials />
      </div>
    </footer>
  );
}

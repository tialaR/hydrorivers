import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { FooterSocials } from './footer-socials';
import styles from './app-footer.module.scss';

const columns = [
  { key: 'product', links: [['/cargas', 'cargoes'], ['/embarcacoes', 'vessels'], ['/negociacoes', 'negotiations'], ['/rastreio', 'tracking']] },
  { key: 'platform', links: [['/dashboard', 'dashboard'], ['/impacto', 'impact'], ['/admin', 'admin'], ['/cargas/nova', 'publish']] },
  { key: 'support', links: [['/login', 'login'], ['/cadastro', 'signup'], ['/perfil', 'profile'], ['/rastreio', 'tracking']] },
  { key: 'company', links: [['/impacto/brdomar', 'brdomar'], ['/impacto/sustainability', 'sustainability'], ['/impacto/regional', 'regional'], ['/impacto/automation', 'automation']] }
] as const;

export async function AppFooter() {
  const t = await getTranslations('footer');
  const nav = await getTranslations('nav');
  const impact = await getTranslations('impactCards');
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
            {column.links.map(([href, label]) => <Link key={href} href={href}>{getLabel(label)}</Link>)}
          </nav>
        ))}
      </div>
      <div className={styles.bottom}>
        <span>© 2026 HydroRivers. {t('copyright')}</span>
        <FooterSocials />
      </div>
    </footer>
  );
}

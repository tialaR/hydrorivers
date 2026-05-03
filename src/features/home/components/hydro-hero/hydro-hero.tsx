import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/ui/button/button';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './hydro-hero.module.scss';

export async function HydroHero() {
  const t = await getTranslations('home');
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p>{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
        <span>{t('description')}</span>
        <div className={styles.actions}>
          <Link href="/cargas"><Button><HydroIcon name="ship" size={18} /> {t('primary')}</Button></Link>
          <Link href="/impacto"><Button variant="secondary"><HydroIcon name="leaf" size={18} /> {t('secondary')}</Button></Link>
        </div>
      </div>
      <aside className={styles.visual} aria-label={t('visualAria')}>
        <div className={styles.riverLine} />
        <div className={styles.routeCard}>
          <span className={styles.iconBubble}><HydroIcon name="river" /></span>
          <h2>{t('visualRouteTitle')}</h2>
          <p>{t('visualRouteDescription')}</p>
        </div>
        <div className={styles.cargoCard}>
          <span className={styles.iconBubble}><HydroIcon name="cargo" /></span>
          <h3>{t('visualCargoTitle')}</h3>
          <p>{t('visualCargoMeta')}</p>
        </div>
        <div className={styles.impactCard}>
          <strong>{t('visualImpactValue')}</strong>
          <small>{t('visualImpactDescription')}</small>
        </div>
      </aside>
    </section>
  );
}

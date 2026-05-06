import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/ui/button/button';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { intlAppPaths } from '@/shared/routing/app-routes';
import styles from './hydro-hero.module.scss';

type HydroHeroProps = {
  locale: string;
};

export async function HydroHero({ locale }: HydroHeroProps) {
  const tHero = await getTranslations({ locale, namespace: 'pages.home.hero' });
  const tVisual = await getTranslations({ locale, namespace: 'pages.home.visualCards' });
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p>{tHero('eyebrow')}</p>
        <h1>{tHero('title')}</h1>
        <span>{tHero('description')}</span>
        <div className={styles.actions}>
          <Link locale={locale} href={intlAppPaths.cargos.marketplace}>
            <Button><HydroIcon name="ship" size={18} /> {tHero('primary')}</Button>
          </Link>
          <Link locale={locale} href={intlAppPaths.impact.home}>
            <Button variant="secondary"><HydroIcon name="leaf" size={18} /> {tHero('secondary')}</Button>
          </Link>
        </div>
      </div>
      <aside className={styles.visual} aria-label={tVisual('aria')}>
        <div className={styles.riverLine} />
        <div className={styles.routeCard}>
          <span className={styles.iconBubble}><HydroIcon name="river" /></span>
          <h2>{tVisual('routeTitle')}</h2>
          <p>{tVisual('routeDescription')}</p>
        </div>
        <div className={styles.cargoCard}>
          <span className={styles.iconBubble}><HydroIcon name="cargo" /></span>
          <h3>{tVisual('cargoTitle')}</h3>
          <p>{tVisual('cargoMeta')}</p>
        </div>
        <div className={styles.impactCard}>
          <strong>{tVisual('impactValue')}</strong>
          <small>{tVisual('impactDescription')}</small>
        </div>
      </aside>
    </section>
  );
}

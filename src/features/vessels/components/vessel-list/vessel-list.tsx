import { getTranslations } from 'next-intl/server';
import type { Vessel } from '@/features/marketplace/domain/marketplace.types';
import { VesselCard } from '../vessel-card/vessel-card';
import styles from './vessel-list.module.scss';

export async function VesselList({ vessels, locale }: { vessels: Vessel[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.vessels' });
  return (
    <section className={styles.grid} aria-label={t('listSectionAriaLabel')}>
      {vessels.map((vessel) => (
        <VesselCard key={vessel.id} vessel={vessel} locale={locale} />
      ))}
    </section>
  );
}

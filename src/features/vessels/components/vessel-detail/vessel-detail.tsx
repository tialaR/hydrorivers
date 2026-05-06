
import { getTranslations } from 'next-intl/server';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { Vessel } from '@/features/marketplace/domain/marketplace.types';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './vessel-detail.module.scss';

type VesselDetailProps = {
  vessel: Vessel;
  locale: string;
};

export async function VesselDetail({ vessel, locale }: VesselDetailProps) {
  const t = await getTranslations({ locale, namespace: 'common' });

  const stats = [
    { label: t('capacity'), value: vessel.capacity, icon: 'cargo', tone: styles.capacity },
    { label: t('eta'), value: translateMock(locale, vessel.eta), icon: 'clock', tone: styles.eta },
    { label: t('draft'), value: vessel.draft, icon: 'anchor', tone: styles.draft },
    { label: t('greenScore'), value: vessel.sustainabilityScore, icon: 'leaf', tone: styles.green }
  ];

  return (
    <section className={styles.layout}>
      <Card className={styles.hero}>
        <div className={styles.image} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.08), rgba(0,0,0,.54)), url(${vessel.imageUrl})` }} />
        <div className={styles.info}>
          <span className={styles.kicker}><HydroIcon name="ship" /> {translateMock(locale, vessel.vesselType)}</span>
          <h2>{vessel.name}</h2>
          <p>{vessel.route}</p>
        </div>
      </Card>
      <div className={styles.stats}>
        {stats.map((item) => (
          <Card key={item.label} className={`${styles.stat} ${item.tone}`}>
            <span className={styles.statIcon}><HydroIcon name={item.icon} /></span>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </Card>
        ))}
      </div>
      <Card className={styles.panel}>
        <h3>{t('documentsAndOperation')}</h3>
        <div className={styles.chips}>{vessel.certifications?.map((item) => <span key={item}><HydroIcon name="document" size={15} />{translateMock(locale, item)}</span>)}</div>
        <h3>{t('availableResources')}</h3>
        <div className={styles.chips}>{vessel.amenities?.map((item) => <span key={item}><HydroIcon name="check" size={15} />{translateMock(locale, item)}</span>)}</div>
        <p>
          {t('vesselOwner')}: <strong>{vessel.owner}</strong>
          {t('inlineListSeparator')}
          {t('flag')}: <strong>{vessel.flag}</strong>
          {t('inlineListSeparator')}
          {t('lastInspection')}: <strong>{vessel.lastInspection}</strong>
        </p>
      </Card>
    </section>
  );
}

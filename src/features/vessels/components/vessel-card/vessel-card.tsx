import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { Badge } from '@/shared/ui/badge/badge';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { Vessel } from '@/features/marketplace/domain/marketplace.types';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './vessel-card.module.scss';

type VesselCardProps = {
  vessel: Vessel;
  locale: string;
};

export async function VesselCard({ vessel, locale }: VesselCardProps) {
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <Link
      locale={locale}
      href={intlAppPaths.vessels.vesselDetail(vessel.id)}
      className={styles.linkWrap}
      aria-label={t('openVessel', { name: vessel.name })}
    >
      <Card className={styles.card}>
        <div className={styles.media} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.08), rgba(0,0,0,.54)), url(${vessel.imageUrl})` }}>
          <Badge tone={vessel.status === 'available' ? 'success' : vessel.status === 'maintenance' ? 'warning' : 'river'}>{t(`vesselStatus.${vessel.status}`)}</Badge>
        </div>
        <div className={styles.body}>
          <div className={styles.title}>
            <span><HydroIcon name="ship" /></span>
            <div><h2>{vessel.name}</h2><p>{translateMock(locale, vessel.vesselType)}</p></div>
          </div>
          <div className={styles.route}><HydroIcon name="route" size={16} /> {vessel.corridor ?? vessel.route}</div>
          <div className={styles.meta}>
            <span><HydroIcon name="cargo" size={16} />{vessel.capacity}</span>
            <span><HydroIcon name="clock" size={16} />{t('eta')} {translateMock(locale, vessel.eta)}</span>
            {vessel.draft ? <span><HydroIcon name="anchor" size={16} />{t('draft')} {vessel.draft}</span> : null}
          </div>
          <div className={styles.readiness}>
            <span className={vessel.documentStatus === 'verified' ? styles.ok : styles.warn}><HydroIcon name="document" size={15} /> {vessel.documentStatus ? t(`vesselDocumentStatus.${vessel.documentStatus}`) : t('emptyValue')}</span>
            <span className={vessel.lowConnectivityReady ? styles.ok : styles.warn}><HydroIcon name="globe" size={15} /> {vessel.lowConnectivityReady ? t('lowConnectivityReady') : t('lowConnectivityPending')}</span>
            <span className={vessel.checklistReady ? styles.ok : styles.warn}><HydroIcon name="check" size={15} /> {vessel.checklistReady ? t('checklistReady') : t('checklistPending')}</span>
          </div>
          <small>{t('vesselOwner')}: {vessel.owner}</small>
        </div>
      </Card>
    </Link>
  );
}

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { Badge } from '@/shared/ui/badge/badge';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './cargo-card.module.scss';

function iconForFamily(family?: Cargo['productFamily']) {
  switch (family) {
    case 'bioeconomy': return 'leaf';
    case 'perishable': return 'cargo';
    case 'territorialSupply': return 'shield';
    case 'industrialCabotage': return 'ship';
    default: return 'cargo';
  }
}

function statusTone(status: Cargo['status']) {
  if (status === 'reserved' || status === 'delivered') return 'success';
  if (status === 'contracting' || status === 'boarded') return 'warning';
  return 'river';
}

function iconForStatus(status: Cargo['status']) {
  if (status === 'open') return 'map';
  if (status === 'bidding') return 'message';
  if (status === 'reserved') return 'check';
  if (status === 'boarded') return 'ship';
  return 'document';
}

export function CargoCard({
  cargo,
  variant
}: {
  cargo: Cargo;
  variant?: 'default' | 'myCargoes';
}) {
  const t = useTranslations('common');
  const locale = useLocale();

  const cargoType = (() => {
    switch (cargo.cargoType) {
      case 'Refrigerada': return t('cargoTypes.refrigerated');
      case 'Seca': return t('cargoTypes.dry');
      case 'Fracionada': return t('cargoTypes.fractional');
      case 'Projeto': return t('cargoTypes.project');
      case 'Cabotagem': return t('cargoTypes.cabotage');
      case 'Reefer': return t('cargoTypes.reefer');
      case 'Granel leve': return t('cargoTypes.bulkLight');
      default: return cargo.cargoType;
    }
  })();

  return (
    <Link
      href={intlAppPaths.cargos.cargoDetail(cargo.id)}
      className={styles.linkWrap}
      data-testid="cargo-card"
      aria-label={t('openCargo', { title: translateMock(locale, cargo.title) })}
    >
      <Card className={`${styles.card} ${styles[cargo.status]} ${variant === 'myCargoes' ? styles.cardMyCargoes : ''}`}>
        <div className={styles.topline}>
          <Badge tone={statusTone(cargo.status)}>
            <HydroIcon name={iconForStatus(cargo.status)} size={13} />
            {t(`cargoStatus.${cargo.status}`)}
          </Badge>
          <Badge tone="success"><HydroIcon name="leaf" size={14} /> {cargo.co2Saving}</Badge>
        </div>

        <div className={styles.heroRow}>
          <span className={`${styles.icon} ${styles[`family_${cargo.productFamily ?? 'default'}`]}`}><HydroIcon name={iconForFamily(cargo.productFamily)} size={24} /></span>
          <div className={styles.titleBlock}>
            <small className={styles.family}>{cargo.productFamily ? t(`productFamilies.${cargo.productFamily}`) : cargoType}</small>
            <h2>{translateMock(locale, cargo.title)}</h2>
            <p>
              {cargo.producer ? `${cargo.producer}${t('inlineListSeparator')}` : ''}
              {cargoType}
              {cargo.temperature ? `${t('inlineListSeparator')}${cargo.temperature}` : ''}
            </p>
          </div>
        </div>

        <div className={styles.routeCard}>
          <div className={styles.routeHeader}>
            <small><HydroIcon name="route" size={14} /> {cargo.corridor ?? t('waterwayRoute')}</small>
            {cargo.mainRiver ? <span><HydroIcon name="waves" size={14} /> {cargo.mainRiver}</span> : null}
          </div>
          <div className={`${styles.routeFlow} ${variant === 'myCargoes' ? styles.routeFlowMyCargoes : ''}`}>
            <div className={`${styles.routeNode} ${variant === 'myCargoes' ? styles.routeNodeOriginAligned : ''}`}>
              <span className={styles.dotOrigin}><HydroIcon name="dock" size={14} /></span>
              <div>
                <small>{t('origin')}</small>
                <strong>{cargo.origin}</strong>
              </div>
            </div>
            <div className={`${styles.routeArrow} ${variant === 'myCargoes' ? styles.routeArrowMyCargoes : ''}`} aria-hidden="true">
              <HydroIcon name="ship" size={16} />
              <span />
            </div>
            <div className={`${styles.routeNode} ${variant === 'myCargoes' ? styles.routeNodeDestinationAligned : ''}`}>
              <span className={styles.dotDestination}><HydroIcon name="map" size={14} /></span>
              <div>
                <small>{t('destination')}</small>
                <strong>{cargo.destination}</strong>
              </div>
            </div>
          </div>
          {cargo.serviceType ? <p className={styles.serviceLabel}><HydroIcon name="river" size={15} /> {translateMock(locale, cargo.serviceType)}</p> : null}
        </div>

        <div className={styles.intelligence}>
          {cargo.etaConfidence ? <span><HydroIcon name="clock" size={15} /> {translateMock(locale, cargo.etaConfidence)}</span> : null}
          {cargo.connectivity ? <span><HydroIcon name="globe" size={15} /> {t(`connectivity.${cargo.connectivity}`)}</span> : null}
          {typeof cargo.documentReadiness === 'number' ? <span><HydroIcon name="document" size={15} /> {t('documentReadiness', { value: cargo.documentReadiness })}</span> : null}
        </div>

        <dl>
          <div><dt><HydroIcon name="cargo" size={14} /> {t('volume')}</dt><dd>{cargo.volume}</dd></div>
          <div><dt><HydroIcon name="clock" size={14} /> {t('window')}</dt><dd>{translateMock(locale, cargo.window)}</dd></div>
          <div><dt><HydroIcon name="coin" size={14} /> {t('target')}</dt><dd>{cargo.targetPrice}</dd></div>
        </dl>

        {cargo.operationalRisks?.length ? (
          <p className={styles.risk}><HydroIcon name="shield" size={15} /> {translateMock(locale, cargo.operationalRisks[0])}</p>
        ) : null}
      </Card>
    </Link>
  );
}


import { getLocale, getTranslations } from 'next-intl/server';
import { getMarketplaceSummary, listCargoes, listNegotiations, listVessels } from '@/features/marketplace/services/marketplace.service';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './dashboard-overview.module.scss';

export async function DashboardOverview() {
  const t = await getTranslations('pages.dashboardOverview');
  const common = await getTranslations('common');
  const locale = await getLocale();
  const [summary, cargoes, vessels, negotiations] = await Promise.all([
    getMarketplaceSummary(), listCargoes(), listVessels(), listNegotiations()
  ]);

  const stats = [
    { icon: 'cargo' as const, label: t('openCargoes'), value: summary.openCargoes, hint: t('activeMarketplace'), trend: t('metricTrendOpenCargoes'), tone: 'cargoTone' },
    { icon: 'ship' as const, label: t('availableVessels'), value: summary.availableVessels, hint: t('riverRoutes'), trend: t('metricTrendVessels'), tone: 'shipTone' },
    { icon: 'document' as const, label: t('activeNegotiations'), value: summary.activeNegotiations, hint: t('quotesAndBookings'), trend: t('metricTrendNegotiations'), tone: 'dealTone' },
    { icon: 'leaf' as const, label: t('averageCo2Saving'), value: summary.averageSaving, hint: t('roadComparison'), trend: common('brDoMar'), tone: 'impactTone' }
  ] as const;

  return (
    <section className={styles.wrap} aria-label={t('sectionAriaLabel')}>
      <div className={styles.grid}>
        {stats.map((item) => (
          <Card key={item.label} className={`${styles.metric} ${styles[item.tone]}`}>
            <span className={styles.icon}><HydroIcon name={item.icon} /></span>
            <div className={styles.metricBody}>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <small>{item.hint}</small>
            </div>
            <em>{item.trend}</em>
          </Card>
        ))}
      </div>

      <div className={styles.panels}>
        <Card className={styles.panel}>
          <div className={styles.panelHeader}><h2>{t('featuredCorridors')}</h2><span>{t('operation')}</span></div>
          {cargoes.slice(0, 6).map((cargo) => (
            <div className={styles.row} key={cargo.id}>
              <span className={styles.routeIcon}><HydroIcon name="route" size={18} /></span>
              <div>
                <strong>
                  {cargo.origin}
                  {t('routeArrow')}
                  {cargo.destination}
                </strong>
                <small>
                  {translateMock(locale, cargo.title)}
                  {common('inlineListSeparator')}
                  {cargo.volume}
                </small>
              </div>
              <b>{cargo.targetPrice}</b>
            </div>
          ))}
        </Card>
        <Card className={styles.panel}>
          <div className={styles.panelHeader}><h2>{t('capacityAndBookings')}</h2><span>{t('liveMock')}</span></div>
          {vessels.slice(0, 4).map((vessel) => (
            <div className={styles.row} key={vessel.id}>
              <span className={styles.shipIcon}><HydroIcon name="ship" size={18} /></span>
              <div>
                <strong>{vessel.name}</strong>
                <small>
                  {vessel.route}
                  {common('inlineListSeparator')}
                  {vessel.capacity}
                </small>
              </div>
              <b>{common(`vesselStatus.${vessel.status}`)}</b>
            </div>
          ))}
        </Card>
      </div>

      <Card className={styles.tablePanel}>
        <div className={styles.panelHeader}><h2>{t('recentNegotiations')}</h2><span>{t('activeCount', { count: negotiations.length })}</span></div>
        <div className={styles.table}>
          {negotiations.slice(0, 8).map((negotiation) => (
            <div className={styles.tableRow} key={negotiation.id}>
              <strong>{negotiation.id}</strong>
              <span>{translateMock(locale, negotiation.cargoTitle)}</span>
              <span>{negotiation.route}</span>
              <span className={styles.stage}>{common(`dealStage.${negotiation.stage}`)}</span>
              <b>{negotiation.amount}</b>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

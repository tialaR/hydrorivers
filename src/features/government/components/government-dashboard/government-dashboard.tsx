import { getTranslations } from 'next-intl/server';
import { listCargoes, listNegotiations, listVessels } from '@/features/marketplace/services/marketplace.service';
import { Card } from '@/shared/ui/card/card';
import { Badge } from '@/shared/ui/badge/badge';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './government-dashboard.module.scss';

export async function GovernmentDashboard({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'pages.government' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const listSep = common('inlineListSeparator');
  const [cargoes, vessels, negotiations] = await Promise.all([listCargoes(), listVessels(), listNegotiations()]);

  const docsPending = cargoes.filter((cargo) => (cargo.documentReadiness ?? 100) < 70).length;
  const seasonalRoutes = cargoes.filter((cargo) => cargo.predictability === 'seasonal').length;
  const bioeconomyCargoes = cargoes.filter((cargo) => cargo.productFamily === 'bioeconomy').length;
  const lowSignalCargoes = cargoes.filter((cargo) => cargo.connectivity === 'lowSignal' || cargo.connectivity === 'delayedSync').length;

  const metrics = [
    { icon: 'leaf' as const, label: t('bioeconomyLoads'), value: bioeconomyCargoes, hint: t('bioeconomyHint') },
    { icon: 'shield' as const, label: t('documentExceptions'), value: docsPending, hint: t('documentHint') },
    { icon: 'route' as const, label: t('seasonalRoutes'), value: seasonalRoutes, hint: t('seasonalHint') },
    { icon: 'globe' as const, label: t('lowSignal'), value: lowSignalCargoes, hint: t('signalHint') }
  ];

  const workflowSteps = [
    { icon: 'user' as const, label: t('workflow.register') },
    { icon: 'cargo' as const, label: t('workflow.publish') },
    { icon: 'route' as const, label: t('workflow.match') },
    { icon: 'document' as const, label: t('workflow.documents') },
    { icon: 'check' as const, label: t('workflow.boarding') },
    { icon: 'waves' as const, label: t('workflow.pod') }
  ];

  const corridors = Array.from(new Map(cargoes.map((cargo) => [cargo.corridor, cargo])).values()).filter((cargo) => cargo.corridor);

  return (
    <section className={styles.wrap} aria-label={t('dashboardSectionAria')}>
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><HydroIcon name="dock" /> {t('heroEyebrow')}</span>
          <h2>{t('heroTitle')}</h2>
          <p>{t('heroDescription')}</p>
        </div>
        <Card className={styles.valueCard}>
          <strong>{t('publicValueScore')}</strong>
          <span>87</span>
          <small>{t('publicValueHint')}</small>
        </Card>
      </div>

      <div className={styles.metrics}>
        {metrics.map((metric) => (
          <Card key={metric.label} className={styles.metric}>
            <span className={styles.metricIcon}><HydroIcon name={metric.icon} /></span>
            <div>
              <small>{metric.label}</small>
              <strong>{metric.value}</strong>
              <p>{metric.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.grid}>
        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span>{t('corridorPanelEyebrow')}</span><h3>{t('corridorPanelTitle')}</h3></div>
            <Badge tone="river">{t('governmentPilot')}</Badge>
          </div>
          <p className={styles.panelLead}>{t('corridorHint')}</p>
          <div className={styles.corridorList}>
            {corridors.slice(0, 6).map((cargo) => (
              <div className={styles.corridor} key={cargo.corridor}>
                <span><HydroIcon name="route" size={18} /></span>
                <div className={styles.itemBody}>
                  <strong>{cargo.corridor}</strong>
                  <div className={styles.metaRow}>
                    <span className={styles.metaPill}><HydroIcon name="river" size={14} /> {cargo.mainRiver}</span>
                    <span className={styles.metaPill}><HydroIcon name="ship" size={14} /> {translateMock(locale, cargo.serviceType)}</span>
                  </div>
                </div>
                <div className={styles.sideInfo}>
                  <small>{t('predictabilityLabel')}</small>
                  <Badge tone={cargo.predictability === 'seasonal' ? 'warning' : 'success'}>{common(`predictability.${cargo.predictability ?? 'medium'}`)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span>{t('complianceEyebrow')}</span><h3>{t('complianceTitle')}</h3></div>
            <Badge tone="warning">{t('actionable')}</Badge>
          </div>
          <div className={styles.complianceList}>
            {cargoes
              .filter((cargo) => (cargo.documentReadiness ?? 100) < 80 || cargo.operationalRisks?.length)
              .slice(0, 5)
              .map((cargo) => (
                <div className={styles.compliance} key={cargo.id}>
                  <div>
                    <strong>{translateMock(locale, cargo.title)}</strong>
                    <small>{cargo.requiredDocuments?.map((doc) => `${doc.name}: ${common(`documentStatus.${doc.status}`)}`).slice(0, 2).join(listSep)}</small>
                  </div>
                  <em>{common('documentReadiness', { value: cargo.documentReadiness ?? 0 })}</em>
                </div>
              ))}
          </div>
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span>{t('fleetEyebrow')}</span><h3>{t('fleetTitle')}</h3></div>
            <Badge tone="success">{vessels.filter((vessel) => vessel.documentStatus === 'verified').length}/{vessels.length}</Badge>
          </div>
          <p className={styles.panelLead}>{t('fleetHint')}</p>
          <div className={styles.fleetList}>
            {vessels.map((vessel) => (
              <div className={styles.fleet} key={vessel.id}>
                <span><HydroIcon name="ship" size={18} /></span>
                <div className={styles.itemBody}>
                  <strong>{vessel.name}</strong>
                  <div className={styles.metaRow}>
                    <span className={styles.metaPill}><HydroIcon name="cargo" size={14} /> {translateMock(locale, vessel.vesselType)}</span>
                    <span className={styles.metaPill}><HydroIcon name="anchor" size={14} /> {vessel.draft}</span>
                    <span className={styles.metaPill}><HydroIcon name="route" size={14} /> {vessel.corridor}</span>
                  </div>
                </div>
                <div className={styles.sideInfo}>
                  <small>{t('fleetStatusLabel')}</small>
                  <Badge tone={vessel.documentStatus === 'verified' ? 'success' : 'warning'}>{common(`vesselDocumentStatus.${vessel.documentStatus ?? 'pending'}`)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span>{t('workflowEyebrow')}</span><h3>{t('workflowTitle')}</h3></div>
            <Badge tone="river">{t('workflowNegotiationsBadge', { count: negotiations.length })}</Badge>
          </div>
          <p className={styles.panelLead}>{t('workflowHint')}</p>
          <ol className={styles.workflow}>
            {workflowSteps.map((step) => (
              <li key={step.label}>
                <span className={styles.workflowIcon}><HydroIcon name={step.icon} size={18} /></span>
                <span>{step.label}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </section>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { intlAppPaths, localizedAppPath } from '@/shared/routing/app-routes';
import { MockScenarioControl } from './mock-scenario-control';
import { MockQaHubPersonas } from './mock-qa-hub';
import styles from './mock-mode.module.scss';

const cases = [
  { id: 'cargoList', href: intlAppPaths.cargos.marketplace, icon: 'cargo' },
  { id: 'cargoDetail', href: intlAppPaths.cargos.cargoDetail('cargo-001'), icon: 'route' },
  { id: 'vessels', href: intlAppPaths.vessels.marketplace, icon: 'ship' },
  { id: 'vesselDetail', href: intlAppPaths.vessels.vesselDetail('vessel-001'), icon: 'anchor' },
  { id: 'negotiations', href: intlAppPaths.negotiations.home, icon: 'message' },
  { id: 'tracking', href: intlAppPaths.tracking.home, icon: 'waves' },
  { id: 'impact', href: intlAppPaths.impact.home, icon: 'chart' },
  { id: 'profile', href: intlAppPaths.auth.profile, icon: 'user' },
  { id: 'lightMode', href: intlAppPaths.dashboard.home, icon: 'sun' },
  { id: 'i18n', href: localizedAppPath('en', intlAppPaths.cargos.marketplace), icon: 'globe', external: true }
] as const;

export function MockMode() {
  const t = useTranslations('mockMode');
  const [open, setOpen] = useState(false);
  const qaCases = useMemo(() => cases, []);

  return (
    <aside className={`${styles.shell} ${open ? styles.open : ''}`} aria-label={t('title')}>
      {open ? (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div>
              <strong>{t('title')}</strong>
              <small>{t('subtitle')}</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t('close')}>
              <HydroIcon name="close" size={18} />
            </button>
          </div>

          <MockScenarioControl />

          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <HydroIcon name="users" size={16} />
              <span>{t('qaHub.sectionTitle')}</span>
            </div>
            <p className={styles.qaHubLead}>{t('qaHub.sectionLead')}</p>
            <MockQaHubPersonas />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <HydroIcon name="check" size={16} />
              <span>{t('casesTitle')}</span>
            </div>
            <div className={styles.caseList}>
              {qaCases.map((item) => (
                <article key={item.id} className={styles.caseCard}>
                  <div>
                    <strong><HydroIcon name={item.icon} size={15} /> {t(`cases.${item.id}.title`)}</strong>
                    <p>{t(`cases.${item.id}.description`)}</p>
                  </div>
                  {'external' in item && item.external ? (
                    <a href={item.href} className={styles.caseLink}>{t('openCase')}</a>
                  ) : (
                    <Link href={item.href} className={styles.caseLink}>{t('openCase')}</Link>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <button
        type="button"
        className={styles.trigger}
        data-testid="mock-mode-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={t('button')}
      >
        <span className={styles.triggerMark}>M</span>
        <span>{t('button')}</span>
      </button>
    </aside>
  );
}

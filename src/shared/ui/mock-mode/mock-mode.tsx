'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { MockScenarioControl } from './mock-scenario-control';
import styles from './mock-mode.module.scss';

const accounts = [
  { id: 'shipper', email: 'tiala@hydrorivers.com', role: 'shipper', company: 'Cooperativa Açaí Norte' },
  { id: 'carrier', email: 'joao@naveganorte.com', role: 'carrier', company: 'Navega Norte' },
  { id: 'admin', email: 'admin@hydrorivers.com', role: 'admin', company: 'HydroRivers' },
  { id: 'shipper2', email: 'mariana@bioamazonia.coop', role: 'shipper', company: 'BioAmazônia Cooperativa' },
  { id: 'carrier2', email: 'carlos@hidroviasmadeira.com', role: 'carrier', company: 'Hidrovias Madeira' }
] as const;

const cases = [
  { id: 'cargoList', href: '/cargas', icon: 'cargo' },
  { id: 'cargoDetail', href: '/cargas/cargo-001', icon: 'route' },
  { id: 'vessels', href: '/embarcacoes', icon: 'ship' },
  { id: 'vesselDetail', href: '/embarcacoes/vessel-001', icon: 'anchor' },
  { id: 'negotiations', href: '/negociacoes', icon: 'message' },
  { id: 'tracking', href: '/rastreio', icon: 'waves' },
  { id: 'impact', href: '/impacto', icon: 'chart' },
  { id: 'profile', href: '/perfil', icon: 'user' },
  { id: 'lightMode', href: '/dashboard', icon: 'sun' },
  { id: 'i18n', href: '/en/cargas', icon: 'globe', external: true }
] as const;

export function MockMode() {
  const t = useTranslations('mockMode');
  const [open, setOpen] = useState(false);
  const password = 'hydro123';
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
              <span>{t('accountsTitle')}</span>
            </div>
            <div className={styles.accountList}>
              {accounts.map((account) => (
                <article key={account.id} className={styles.accountCard}>
                  <strong>{t(`roles.${account.role}`)}</strong>
                  <span>{account.company}</span>
                  <small>{account.email}</small>
                  <code>{t('passwordLabel')}: {password}</code>
                </article>
              ))}
            </div>
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

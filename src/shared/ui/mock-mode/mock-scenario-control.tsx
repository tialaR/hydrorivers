'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { mockScenarioIds, type MockScenarioId } from '@/shared/config/mock-scenario-ids';
import { apiRoutes } from '@/shared/routing/api-routes';
import styles from './mock-mode.module.scss';

type MockModeApiResponse = {
  data?: {
    activeScenario?: string;
    scenarios?: string[];
  };
};

async function readActiveScenario(): Promise<{ active: string | null; scenarioId: MockScenarioId | null }> {
  const res = await fetch(apiRoutes.mockMode.root, { credentials: 'include' });
  const json = (await res.json()) as MockModeApiResponse;
  const next = json.data?.activeScenario ?? null;
  const scenarioId =
    next && mockScenarioIds.includes(next as MockScenarioId) ? (next as MockScenarioId) : null;
  return { active: next, scenarioId };
}

export function MockScenarioControl() {
  const t = useTranslations('mockMode');
  const c = useTranslations('common');
  const { user, ready } = useAuthSession();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<MockScenarioId>(mockScenarioIds[0]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ready || user?.role !== 'admin') return;
    let cancelled = false;
    readActiveScenario()
      .then(({ active, scenarioId }) => {
        if (cancelled) return;
        setActiveScenario(active);
        if (scenarioId) setSelectedScenario(scenarioId);
      })
      .catch(() => {
        if (!cancelled) setActiveScenario(null);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user?.role]);

  const apply = async () => {
    setPending(true);
    setError(false);
    try {
      const res = await fetch(apiRoutes.mockMode.root, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ scenario: selectedScenario })
      });
      const json = (await res.json()) as MockModeApiResponse;
      if (!res.ok) {
        setError(true);
        return;
      }
      const next = json.data?.activeScenario ?? selectedScenario;
      setActiveScenario(next);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hydrorivers:mock-changed'));
      }
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };

  if (!ready || user?.role !== 'admin') {
    return null;
  }

  const activeLabel =
    activeScenario && mockScenarioIds.includes(activeScenario as MockScenarioId)
      ? t(`scenarioIds.${activeScenario as MockScenarioId}`)
      : activeScenario
        ? activeScenario
        : c('emptyValue');

  return (
    <section className={styles.section} data-testid="mock-scenario-section" aria-label={t('scenarioControlTitle')}>
      <div className={styles.sectionTitle}>
        <HydroIcon name="filter" size={16} />
        <span>{t('scenarioControlTitle')}</span>
      </div>
      <p className={styles.scenarioActive} data-testid="mock-scenario-active">
        {t('scenarioActive', { label: activeLabel })}
      </p>
      <div className={styles.scenarioRow}>
        <label className={styles.scenarioLabel} htmlFor="mock-scenario-select">
          {t('scenarioSelectLabel')}
        </label>
        <select
          id="mock-scenario-select"
          data-testid="mock-scenario-select"
          value={selectedScenario}
          onChange={(event) => setSelectedScenario(event.target.value as MockScenarioId)}
        >
          {mockScenarioIds.map((id) => (
            <option key={id} value={id}>
              {t(`scenarioIds.${id}`)}
            </option>
          ))}
        </select>
        <button type="button" data-testid="mock-scenario-apply" disabled={pending} onClick={() => void apply()}>
          {pending ? t('scenarioApplying') : t('applyScenario')}
        </button>
      </div>
      {error ? <p className={styles.scenarioError}>{t('applyScenarioError')}</p> : null}
    </section>
  );
}

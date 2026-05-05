'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { AppLocale } from '@/core/i18n/routing';
import type { AiAssistResponse } from '@/features/ai-assist/domain/types';
import { Card } from '@/shared/ui/card/card';
import { Button } from '@/shared/ui/button/button';
import { apiRoutes } from '@/shared/routing/api-routes';
import { httpStatus } from '@/shared/http/http-status';
import styles from './cargo-status-assistant-card.module.scss';

type Props = {
  cargoId: string;
};

type LoadState = 'loading' | 'ready' | 'error' | 'guest' | 'forbidden';

export function CargoStatusAssistantCard({ cargoId }: Props) {
  const t = useTranslations('cargoStatusAi');
  const locale = useLocale() as AppLocale;
  const [state, setState] = useState<LoadState>('loading');
  const [assist, setAssist] = useState<AiAssistResponse | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    setAssist(null);
    try {
      const response = await fetch(apiRoutes.ai.cargoStatus, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ cargoId, locale })
      });
      if (response.status === httpStatus.unauthorized) {
        setState('guest');
        return;
      }
      if (response.status === httpStatus.forbidden) {
        setState('forbidden');
        return;
      }
      if (!response.ok) {
        setState('error');
        return;
      }
      const body = (await response.json()) as { data?: AiAssistResponse };
      if (!body.data) {
        setState('error');
        return;
      }
      setAssist(body.data);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [cargoId, locale]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [load]);

  const confidenceLabel = assist ? t(`confidence.${assist.confidence}`) : '';
  const sourceLabel = assist ? t(`source.${assist.source === 'mock-ai' ? 'mockAi' : 'fallbackRule'}`) : '';

  return (
    <div className={styles.wrap}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <span className={styles.kicker}>{t('disclaimerShort')}</span>
          <h3>{t('cardTitle')}</h3>
          <p className={styles.hint}>{t('cardHint')}</p>
        </div>

        {state === 'loading' ? <p className={styles.empty}>{t('loading')}</p> : null}
        {state === 'guest' ? <p className={styles.empty}>{t('notAuthenticatedHint')}</p> : null}
        {state === 'forbidden' ? <p className={styles.empty}>{t('forbiddenHint')}</p> : null}
        {state === 'error' ? (
          <>
            <p className={styles.empty}>{t('loadError')}</p>
            <div className={styles.retry}>
              <Button type="button" onClick={() => void load()}>{t('retry')}</Button>
            </div>
          </>
        ) : null}

        {state === 'ready' && assist ? (
          <>
            <section className={styles.section} aria-labelledby="cargo-ai-summary">
              <h4 id="cargo-ai-summary" className={styles.sectionTitle}>{t('summaryLabel')}</h4>
              <p className={styles.body}>{assist.summary}</p>
            </section>

            <section className={styles.section} aria-labelledby="cargo-ai-next">
              <h4 id="cargo-ai-next" className={styles.sectionTitle}>{t('nextStepsLabel')}</h4>
              {assist.nextSteps.length ? (
                <ul className={styles.list}>{assist.nextSteps.map((item, index) => <li key={`n-${index}`}>{item}</li>)}</ul>
              ) : (
                <p className={styles.empty}>{t('emptyList')}</p>
              )}
            </section>

            <section className={styles.section} aria-labelledby="cargo-ai-blockers">
              <h4 id="cargo-ai-blockers" className={styles.sectionTitle}>{t('blockersLabel')}</h4>
              {assist.blockers.length ? (
                <ul className={styles.list}>{assist.blockers.map((item, index) => <li key={`b-${index}`}>{item}</li>)}</ul>
              ) : (
                <p className={styles.empty}>{t('emptyList')}</p>
              )}
            </section>

            <section className={styles.section} aria-labelledby="cargo-ai-risks">
              <h4 id="cargo-ai-risks" className={styles.sectionTitle}>{t('risksLabel')}</h4>
              {assist.risks.length ? (
                <ul className={styles.list}>{assist.risks.map((item, index) => <li key={`r-${index}`}>{item}</li>)}</ul>
              ) : (
                <p className={styles.empty}>{t('emptyList')}</p>
              )}
            </section>

            <div className={styles.meta}>
              <span><strong>{t('confidenceLabel')}:</strong> {confidenceLabel}</span>
              <span><strong>{t('sourceLabel')}:</strong> {sourceLabel}</span>
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
}

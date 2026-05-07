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
  cargoId?: string | null;
};

type LoadState = 'idle' | 'loading' | 'success' | 'unauthorized' | 'forbidden' | 'error';
type ErrorKind = 'invalidCargoId' | 'badRequest' | 'notFound' | 'generic';

export function CargoStatusAssistantCard({ cargoId }: Props) {
  const t = useTranslations('cargoStatusAi');
  const locale = useLocale() as AppLocale;
  const [state, setState] = useState<LoadState>('idle');
  const [assist, setAssist] = useState<AiAssistResponse | null>(null);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const normalizedCargoId = typeof cargoId === 'string' ? cargoId.trim() : '';
  const hasValidCargoId = normalizedCargoId.length > 0;

  const load = useCallback(async () => {
    if (!hasValidCargoId) {
      setState('error');
      setAssist(null);
      setErrorKind('invalidCargoId');
      return;
    }

    setState('loading');
    setAssist(null);
    setErrorKind(null);
    try {
      const response = await fetch(apiRoutes.ai.cargoStatus, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ cargoId: normalizedCargoId, locale })
      });
      if (response.status === httpStatus.unauthorized) {
        setState('unauthorized');
        return;
      }
      if (response.status === httpStatus.forbidden) {
        setState('forbidden');
        return;
      }
      if (response.status === httpStatus.badRequest) {
        setState('error');
        setErrorKind('badRequest');
        return;
      }
      if (response.status === httpStatus.notFound) {
        setState('error');
        setErrorKind('notFound');
        return;
      }
      if (!response.ok) {
        setState('error');
        setErrorKind('generic');
        return;
      }
      const body = (await response.json()) as { data?: AiAssistResponse };
      if (!body.data) {
        setState('error');
        setErrorKind('generic');
        return;
      }
      setAssist(body.data);
      setState('success');
    } catch {
      setState('error');
      setErrorKind('generic');
    }
  }, [hasValidCargoId, locale, normalizedCargoId]);

  useEffect(() => {
    if (!hasValidCargoId) {
      setState('error');
      setAssist(null);
      setErrorKind('invalidCargoId');
      return;
    }
    setState('idle');
    setAssist(null);
    setErrorKind(null);
    const handle = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [hasValidCargoId, load]);

  const confidenceLabel = assist ? t(`confidence.${assist.confidence}`) : '';
  const sourceLabel = assist ? t(`source.${assist.source === 'mock-ai' ? 'mockAi' : 'fallbackRule'}`) : '';
  const errorMessage = errorKind ? t(`errors.${errorKind}`) : t('errors.generic');

  return (
    <div className={styles.wrap}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <span className={styles.kicker}>{t('disclaimerShort')}</span>
          <h3>{t('cardTitle')}</h3>
          <p className={styles.hint}>{t('cardHint')}</p>
        </div>

        <div className={styles.statusArea} aria-live="polite" aria-atomic="true">
          {state === 'idle' ? <p className={styles.empty}>{t('idleHint')}</p> : null}
          {state === 'loading' ? <p className={styles.empty}>{t('loading')}</p> : null}
          {state === 'unauthorized' ? <p className={styles.empty}>{t('notAuthenticatedHint')}</p> : null}
          {state === 'forbidden' ? <p className={styles.empty}>{t('forbiddenHint')}</p> : null}
          {state === 'error' ? (
            <>
              <p className={styles.empty}>{errorMessage}</p>
              {errorKind !== 'invalidCargoId' ? (
                <div className={styles.retry}>
                  <Button type="button" onClick={() => void load()} aria-label={t('retry')}>
                    {t('retry')}
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        {state === 'success' && assist ? (
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

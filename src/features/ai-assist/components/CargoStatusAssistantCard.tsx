'use client';

import { useCallback, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { AppLocale } from '@/core/i18n/routing';
import type { AiAssistResponse } from '@/features/ai-assist/domain/types';
import type { CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import { Card } from '@/shared/ui/card/card';
import { Button } from '@/shared/ui/button/button';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { apiRoutes } from '@/shared/routing/api-routes';
import { httpStatus } from '@/shared/http/http-status';
import styles from './cargo-status-assistant-card.module.scss';

type Props = {
  cargoId?: string | null;
  cargoName?: string | null;
  cargoStatus?: CargoStatus;
};

type LoadState = 'idle' | 'loading' | 'success' | 'unauthorized' | 'forbidden' | 'error';
type ErrorKind = 'invalidCargoId' | 'badRequest' | 'notFound' | 'generic';
type TimelineStep = {
  status: CargoStatus;
  icon: 'cargo' | 'message' | 'document' | 'anchor' | 'ship' | 'check';
};
type StageKey = CargoStatus | 'unknown';

const timelineSteps: TimelineStep[] = [
  { status: 'open', icon: 'cargo' },
  { status: 'bidding', icon: 'message' },
  { status: 'contracting', icon: 'document' },
  { status: 'reserved', icon: 'anchor' },
  { status: 'boarded', icon: 'ship' },
  { status: 'delivered', icon: 'check' }
];

export function CargoStatusAssistantCard({ cargoId, cargoName, cargoStatus = 'open' }: Props) {
  const locale = useLocale() as AppLocale;
  const contextCargoId = typeof cargoId === 'string' ? cargoId.trim() : '';

  return (
    <CargoStatusAssistantCardInner
      key={`${locale}:${contextCargoId}`}
      cargoId={cargoId}
      cargoName={cargoName}
      cargoStatus={cargoStatus}
      locale={locale}
    />
  );
}

type InnerProps = Props & {
  locale: AppLocale;
};

function CargoStatusAssistantCardInner({ cargoId, cargoName, cargoStatus = 'open', locale }: InnerProps) {
  const t = useTranslations('cargoStatusAi');
  const [state, setState] = useState<LoadState>('idle');
  const [expanded, setExpanded] = useState(false);
  const [assist, setAssist] = useState<AiAssistResponse | null>(null);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const [attemptedLoad, setAttemptedLoad] = useState(false);
  const normalizedCargoId = typeof cargoId === 'string' ? cargoId.trim() : '';
  const normalizedCargoName = typeof cargoName === 'string' && cargoName.trim() ? cargoName.trim() : t('card.fallbackCargoName');
  const hasValidCargoId = normalizedCargoId.length > 0;
  const currentStepIndex = timelineSteps.findIndex((step) => step.status === cargoStatus);
  const currentStage: StageKey = assist?.source === 'fallback-rule' ? 'unknown' : cargoStatus;
  const currentStageLabel = t(`stages.${currentStage}`);
  const attentionCount = assist?.attentionPoints?.length ?? 0;
  const nextStepsCount = assist?.nextSteps.length ?? 0;

  const load = useCallback(async () => {
    setAttemptedLoad(true);
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

  function handleToggleAccordion() {
    const willExpand = !expanded;
    setExpanded(willExpand);
    if (!willExpand) return;
    if (attemptedLoad) return;
    void load();
  }

  const confidenceLabel = assist ? t(`meta.confidence${assist.confidence[0].toUpperCase()}${assist.confidence.slice(1)}`) : t('meta.confidenceMedium');
  const errorTitle = t(`states.${state}Title`);
  const errorDescription = state === 'error'
    ? t(`errors.${errorKind ?? 'generic'}`)
    : t(`states.${state}Description`);
  const currentStageHint = t(`timeline.hints.${currentStage}`);

  return (
    <div className={styles.wrap}>
      <Card className={styles.card}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={expanded}
          aria-controls="cargo-ai-panel"
          onClick={handleToggleAccordion}
        >
          <div className={styles.triggerMain}>
            <div className={styles.avatar} aria-hidden="true">
              <HydroIcon name="message" size={22} />
            </div>
            <div className={styles.triggerText}>
              <span className={styles.kicker}>{t('card.eyebrow')}</span>
              <p className={styles.heroLine}>{t('card.greeting')}</p>
              <p className={styles.secondaryLine}>{t('card.collapsedTitle', { cargoName: normalizedCargoName })}</p>
              <p className={styles.hint}>{t('card.collapsedDescription')}</p>
            </div>
          </div>
          <div className={styles.triggerMeta}>
            <span className={styles.stageChip}>
              <HydroIcon name="route" size={16} />
              {t('card.currentStage')}: {currentStageLabel}
            </span>
            <span className={styles.counterChip}>
              <HydroIcon name="shield" size={15} />
              {t('card.alertsCount', { count: attentionCount })}
            </span>
            <span className={styles.counterChip}>
              <HydroIcon name="check" size={15} />
              {t('card.nextStepsCount', { count: nextStepsCount })}
            </span>
            <span className={styles.cta}>
              {expanded ? t('card.collapseAction') : t('card.expandAction')}
              <HydroIcon name="chevronDown" size={17} className={expanded ? styles.chevronUp : styles.chevronDown} />
            </span>
          </div>
        </button>

        {expanded ? (
          <div id="cargo-ai-panel" className={styles.panel}>
            <section className={styles.section} aria-labelledby="cargo-ai-timeline">
              <h4 id="cargo-ai-timeline" className={styles.sectionTitle}>
                <HydroIcon name="clock" size={15} />
                {t('sections.timeline')}
              </h4>
              <p className={styles.timelineHint}>{currentStageHint}</p>
              <ol className={styles.timeline} aria-label={t('sections.timeline')}>
                {timelineSteps.map((step, index) => {
                  const stateTone = index < currentStepIndex ? 'done' : index === currentStepIndex ? 'current' : 'pending';
                  return (
                    <li key={step.status} className={styles[`step-${stateTone}`]}>
                      <span className={styles.stepIcon}>
                        <HydroIcon name={step.icon} size={14} />
                      </span>
                      <span className={styles.stepLabel}>{t(`stages.${step.status}`)}</span>
                    </li>
                  );
                })}
                {currentStage === 'unknown' ? (
                  <li className={styles['step-current']}>
                    <span className={styles.stepIcon}>
                      <HydroIcon name="info" size={14} />
                    </span>
                    <span className={styles.stepLabel}>{t('stages.unknown')}</span>
                  </li>
                ) : null}
              </ol>
            </section>

            <div className={styles.statusArea} aria-live="polite" aria-atomic="true">
              {state === 'idle' ? (
                <div className={styles.stateBox}>
                  <p className={styles.stateTitle}>{t('states.idleTitle')}</p>
                  <p className={styles.empty}>{t('states.idleDescription')}</p>
                </div>
              ) : null}
              {state === 'loading' ? (
                <div className={styles.stateBox}>
                  <p className={styles.stateTitle}>{t('states.loadingTitle')}</p>
                  <p className={styles.empty}>{t('states.loadingDescription')}</p>
                </div>
              ) : null}
              {state === 'unauthorized' ? (
                <div className={styles.stateBox}>
                  <p className={styles.stateTitle}>{t('states.unauthorizedTitle')}</p>
                  <p className={styles.empty}>{t('states.unauthorizedDescription')}</p>
                </div>
              ) : null}
              {state === 'forbidden' ? (
                <div className={styles.stateBox}>
                  <p className={styles.stateTitle}>{t('states.forbiddenTitle')}</p>
                  <p className={styles.empty}>{t('states.forbiddenDescription')}</p>
                </div>
              ) : null}
              {state === 'error' ? (
                <>
                  <div className={styles.stateBox}>
                    <p className={styles.stateTitle}>{errorTitle}</p>
                    <p className={styles.empty}>{errorDescription}</p>
                  </div>
                  {errorKind !== 'invalidCargoId' ? (
                    <div className={styles.retry}>
                      <Button type="button" onClick={() => void load()} aria-label={t('states.retryAction')}>
                        {t('states.retryAction')}
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            {state === 'success' && assist ? (
              <>
                {assist.heading ? (
                  <section className={`${styles.section} ${styles.sectionHeader}`} aria-labelledby="cargo-ai-heading">
                    <h4 id="cargo-ai-heading" className={styles.sectionTitle}>
                      <span className={styles.sectionIcon}><HydroIcon name="info" size={16} /></span>
                      {t('card.title')}
                    </h4>
                    <p className={styles.body}>{t('card.greeting')}</p>
                    <p className={styles.body}>{t('card.collapsedTitle', { cargoName: normalizedCargoName })}</p>
                    <p className={styles.body}>{t('card.expandedIntro')}</p>
                  </section>
                ) : null}

                <section className={`${styles.section} ${styles.sectionSummary}`} aria-labelledby="cargo-ai-summary">
                  <h4 id="cargo-ai-summary" className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}><HydroIcon name="document" size={16} /></span>
                    {t('sections.summary')}
                  </h4>
                  <p className={styles.body}>{assist.summary}</p>
                </section>

                {assist.explanation ? (
                  <section className={`${styles.section} ${styles.sectionExplanation}`} aria-labelledby="cargo-ai-explanation">
                    <h4 id="cargo-ai-explanation" className={styles.sectionTitle}>
                      <span className={styles.sectionIcon}><HydroIcon name="message" size={16} /></span>
                      {t('sections.explanation')}
                    </h4>
                    <p className={styles.body}>{assist.explanation}</p>
                  </section>
                ) : null}

                <section className={`${styles.section} ${styles.sectionNext}`} aria-labelledby="cargo-ai-next">
                  <h4 id="cargo-ai-next" className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}><HydroIcon name="check" size={16} /></span>
                    {t('sections.nextSteps')}
                  </h4>
                  {assist.nextSteps.length ? (
                    <ul className={styles.listCards}>
                      {assist.nextSteps.map((item, index) => (
                        <li key={`n-${index}`}>
                          <span className={styles.itemBadge}>{index + 1}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.empty}>{t('emptyStates.noNextSteps')}</p>
                  )}
                </section>

                <section className={`${styles.section} ${styles.sectionAttention}`} aria-labelledby="cargo-ai-attention">
                  <h4 id="cargo-ai-attention" className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}><HydroIcon name="shield" size={16} /></span>
                    {t('sections.attentionPoints')}
                  </h4>
                  {assist.attentionPoints?.length ? (
                    <ul className={styles.listCards}>
                      {assist.attentionPoints.map((item, index) => (
                        <li key={`a-${index}`}>
                          <span className={styles.itemBadge}><HydroIcon name="info" size={12} /></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.empty}>{t('emptyStates.noAlerts')}</p>
                  )}
                </section>

                <section className={`${styles.section} ${styles.sectionRisks}`} aria-labelledby="cargo-ai-risks">
                  <h4 id="cargo-ai-risks" className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}><HydroIcon name="leaf" size={16} /></span>
                    {t('sections.risks')}
                  </h4>
                  {assist.risks.length ? (
                    <ul className={styles.listCards}>
                      {assist.risks.map((item, index) => (
                        <li key={`r-${index}`}>
                          <span className={styles.itemBadge}><HydroIcon name="leaf" size={12} /></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.empty}>{t('emptyStates.noAlerts')}</p>
                  )}
                </section>

                <section className={`${styles.section} ${styles.sectionBlockers}`} aria-labelledby="cargo-ai-blockers">
                  <h4 id="cargo-ai-blockers" className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}><HydroIcon name="anchor" size={16} /></span>
                    {t('sections.blockers')}
                  </h4>
                  {assist.blockers.length ? (
                    <ul className={styles.listCards}>
                      {assist.blockers.map((item, index) => (
                        <li key={`b-${index}`}>
                          <span className={styles.itemBadge}><HydroIcon name="anchor" size={12} /></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.empty}>{t('emptyStates.noBlockers')}</p>
                  )}
                </section>

                <div className={styles.meta}>
                  <span>{t('meta.basedOnCurrentData')} • {t('meta.confidence')}: {confidenceLabel}</span>
                  <span>{t('meta.mockSource')}</span>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}

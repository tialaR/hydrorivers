'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card } from '@/shared/ui/card/card';
import { Button } from '@/shared/ui/button/button';
import { HydroIcon, type HydroIconName } from '@/shared/ui/hydro-icon/hydro-icon';
import { trackingEvents } from '@/features/marketplace/data/marketplace.mock';
import type { OperationalTrackingEventKind } from '@/features/marketplace/domain/marketplace.types';
import { resolveOperationalTrackingKind } from '@/features/marketplace/domain/tracking.helpers';
import { translateMock } from '@/shared/i18n/mock-content';
import styles from './tracking-timeline.module.scss';

function iconForOperationalKind(kind: OperationalTrackingEventKind): HydroIconName {
  switch (kind) {
    case 'cargo_created':
      return 'cargo';
    case 'proposal_sent':
      return 'message';
    case 'negotiation_accepted':
      return 'check';
    case 'documentation_pending':
      return 'document';
    case 'shipment_confirmed':
      return 'dock';
    case 'in_transit':
      return 'ship';
    case 'delay_reported':
      return 'globe';
    case 'delivered':
      return 'check';
    case 'proof_attached':
      return 'document';
    default:
      return 'clock';
  }
}

export function TrackingTimeline() {
  const t = useTranslations('pages.tracking');
  const c = useTranslations('common');
  const locale = useLocale();
  const [code, setCode] = useState('HYD-2026-00124');
  const [searched, setSearched] = useState(true);

  const progress = useMemo(() => {
    const done = trackingEvents.filter((event) => event.status === 'done' || event.status === 'current').length;
    return Math.round((done / trackingEvents.length) * 100);
  }, []);

  return (
    <section className={styles.grid} aria-label={t('listSectionAriaLabel')}>
      <Card className={styles.search}>
        <label>
          <span>{t('trackingCode')}</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} />
        </label>
        <Button onClick={() => setSearched(true)}>
          <HydroIcon name="map" size={18} /> {t('track')}
        </Button>
      </Card>

      {searched && (
        <>
          <Card className={styles.summary}>
            <span className={styles.kicker}><HydroIcon name="route" /> {t('inRiverRoute')}</span>
            <h2>{code}</h2>
            <p>{t('sampleRoute')}</p>
            <strong>{t('sampleCargo')}</strong>
            <div className={styles.progress} aria-label={t('progressAria', { progress })}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.kpis}>
              <span>{t('temperature')}</span>
              <span>{t('eta')}</span>
              <span>{t('insurance')}</span>
            </div>
          </Card>

          <Card className={styles.details}>
            <h3>{t('operationalInfo')}</h3>
            <dl>
              <div><dt>{t('vessel')}</dt><dd>{t('sampleVessel')}</dd></div>
              <div><dt>{t('operator')}</dt><dd>{t('sampleOperator')}</dd></div>
              <div><dt>{t('lastSync')}</dt><dd>{t('sampleLastSync')}</dd></div>
              <div><dt>{t('proofs')}</dt><dd>{t('sampleProofs')}</dd></div>
            </dl>
          </Card>

          <Card className={styles.timeline}>
            <div className={styles.timelineHeader}>
              <span><HydroIcon name="river" /> {t('timelineTitle')}</span>
              <strong>{t('progressLabel', { progress })}</strong>
            </div>
            <ol>
              {trackingEvents.map((event) => {
                const kind = resolveOperationalTrackingKind(event);
                const headline = translateMock(locale, event.title);
                return (
                  <li
                    className={`${styles.event} ${styles[event.status]}`}
                    key={event.id}
                    aria-label={t('timelineEventAria', { title: headline })}
                  >
                    <span className={styles.rail} aria-hidden="true" />
                    <span className={styles.icon}>
                      <HydroIcon name={iconForOperationalKind(kind)} size={18} />
                    </span>
                    <div className={styles.eventBody}>
                      <div className={styles.eventTop}>
                        <h3>{headline}</h3>
                        {event.occurredAt ? (
                          <time dateTime={event.occurredAt}>{translateMock(locale, event.timestamp)}</time>
                        ) : (
                          <span>{translateMock(locale, event.timestamp)}</span>
                        )}
                      </div>
                      <p>{translateMock(locale, event.description)}</p>
                      <small>
                        <HydroIcon name="dock" size={14} /> {event.location}
                        {event.evidence ? (
                          <>
                            {c('inlineListSeparator')}
                            {translateMock(locale, event.evidence)}
                          </>
                        ) : null}
                      </small>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </>
      )}
    </section>
  );
}

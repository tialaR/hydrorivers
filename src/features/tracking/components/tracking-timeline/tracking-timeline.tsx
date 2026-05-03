'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card } from '@/shared/ui/card/card';
import { Button } from '@/shared/ui/button/button';
import { HydroIcon, type HydroIconName } from '@/shared/ui/hydro-icon/hydro-icon';
import { trackingEvents } from '@/features/marketplace/data/marketplace.mock';
import { translateMock } from '@/shared/i18n/mock-content';
import type { TrackingEvent } from '@/features/marketplace/domain/marketplace.types';
import styles from './tracking-timeline.module.scss';

function iconForEvent(event: TrackingEvent): HydroIconName {
  const text = `${event.title} ${event.description} ${event.evidence ?? ''}`.toLowerCase();
  if (text.includes('document')) return 'document';
  if (text.includes('lacre') || text.includes('checklist')) return 'shield';
  if (text.includes('navega') || text.includes('rota')) return 'ship';
  if (text.includes('sinal') || text.includes('sincron')) return 'globe';
  if (text.includes('atraca') || text.includes('entrega')) return 'dock';
  if (event.status === 'done') return 'check';
  if (event.status === 'current') return 'map';
  return 'clock';
}

export function TrackingTimeline() {
  const t = useTranslations('pages.tracking');
  const locale = useLocale();
  const [code, setCode] = useState('HYD-2026-00124');
  const [searched, setSearched] = useState(true);

  const progress = useMemo(() => {
    const done = trackingEvents.filter((event) => event.status === 'done' || event.status === 'current').length;
    return Math.round((done / trackingEvents.length) * 100);
  }, []);

  return (
    <section className={styles.grid}>
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
              {trackingEvents.map((event) => (
                <li className={`${styles.event} ${styles[event.status]}`} key={event.id}>
                  <span className={styles.rail} aria-hidden="true" />
                  <span className={styles.icon}><HydroIcon name={iconForEvent(event)} size={18} /></span>
                  <div className={styles.eventBody}>
                    <div className={styles.eventTop}>
                      <h3>{translateMock(locale, event.title)}</h3>
                      <time>{translateMock(locale, event.timestamp)}</time>
                    </div>
                    <p>{translateMock(locale, event.description)}</p>
                    <small><HydroIcon name="dock" size={14} /> {event.location}{event.evidence ? ` • ${translateMock(locale, event.evidence)}` : ''}</small>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </>
      )}
    </section>
  );
}

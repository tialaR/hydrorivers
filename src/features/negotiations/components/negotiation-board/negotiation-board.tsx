import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { Badge } from '@/shared/ui/badge/badge';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { DealStage, Negotiation } from '@/features/marketplace/domain/marketplace.types';
import { translateMock } from '@/shared/i18n/mock-content';
import { formatMockBrl, formatMockDate } from '@/shared/i18n/mock-format';
import styles from './negotiation-board.module.scss';

function progress(stage: DealStage) {
  const map: Record<DealStage, number> = {
    quote: 24,
    counteroffer: 42,
    contract: 62,
    boarding: 82,
    delivered: 100
  };
  return map[stage];
}

function iconForTitle(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('açaí') || normalized.includes('castanha') || normalized.includes('cacau')) return 'leaf';
  if (normalized.includes('pirarucu') || normalized.includes('medic')) return 'cargo';
  if (normalized.includes('solar')) return 'shield';
  return 'document';
}

type NegotiationBoardProps = {
  negotiations: Negotiation[];
  locale: string;
};

export async function NegotiationBoard({ negotiations, locale }: NegotiationBoardProps) {
  const p = await getTranslations({ locale, namespace: 'pages.negotiations' });
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <section className={styles.board} aria-label={p('listSectionAriaLabel')}>
      {negotiations.map((item) => (
        <Link
          key={item.id}
          locale={locale}
          href={intlAppPaths.negotiations.negotiationDetail(item.id)}
          className={styles.linkWrap}
          data-testid="negotiation-card"
          aria-label={t('openNegotiation', { title: translateMock(locale, item.cargoTitle) })}
        >
          <Card className={`${styles.card} ${styles[item.riskLevel ?? 'low']}`}>
            <div className={styles.top}>
              <span className={styles.icon}><HydroIcon name={iconForTitle(item.cargoTitle)} /></span>
              <Badge tone={item.stage === 'contract' || item.stage === 'boarding' ? 'warning' : item.stage === 'delivered' ? 'success' : 'river'}>{t(`dealStage.${item.stage}`)}</Badge>
            </div>
            <h2>{translateMock(locale, item.cargoTitle)}</h2>
            <p><HydroIcon name="ship" size={15} /> {item.vesselName}</p>
            {item.route ? <p><HydroIcon name="route" size={15} /> {item.route}</p> : null}
            <strong>{formatMockBrl(locale, item.amount)}</strong>
            <div className={styles.timeline} aria-label={t('negotiationProgress', { progress: progress(item.stage) })}><span style={{ width: `${progress(item.stage)}%` }} /></div>
            <small>
              {translateMock(locale, formatMockDate(locale, item.lastUpdate))}
              {t('inlineListSeparator')}
              {translateMock(locale, item.nextStep)}
            </small>
          </Card>
        </Link>
      ))}
    </section>
  );
}

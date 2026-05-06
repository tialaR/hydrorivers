import { getTranslations } from 'next-intl/server';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import type { Negotiation } from '@/features/marketplace/domain/marketplace.types';
import { translateMock } from '@/shared/i18n/mock-content';
import { formatMockBrl, formatMockDate } from '@/shared/i18n/mock-format';
import styles from './negotiation-detail.module.scss';

type NegotiationDetailProps = {
  negotiation: Negotiation;
  locale: string;
};

export async function NegotiationDetail({ negotiation, locale }: NegotiationDetailProps) {
  const t = await getTranslations({ locale, namespace: 'pages.negotiationDetail' });
  const common = await getTranslations({ locale, namespace: 'common' });

  return (
    <section className={styles.layout}>
      <Card className={styles.summary}>
        <span data-testid="negotiation-stage-label"><HydroIcon name="document" /> {common(`dealStage.${negotiation.stage}`)}</span>
        <h2>{translateMock(locale, negotiation.cargoTitle)}</h2>
        <p>
          {negotiation.route}
          {common('inlineListSeparator')}
          {negotiation.vesselName}
        </p>
        <strong>{formatMockBrl(locale, negotiation.amount)}</strong>
      </Card>
      <Card className={styles.panel}>
        <h3>{t('terms')}</h3>
        <dl>
          <div><dt>{t('parties')}</dt><dd>{negotiation.parties.join(t('partyListJoiner'))}</dd></div>
          <div><dt>{t('payment')}</dt><dd>{translateMock(locale, negotiation.paymentTerms)}</dd></div>
          <div><dt>{t('insurance')}</dt><dd>{translateMock(locale, negotiation.insurance)}</dd></div>
          <div><dt>{t('nextStep')}</dt><dd>{translateMock(locale, negotiation.nextStep)}</dd></div>
        </dl>
      </Card>
      <Card className={styles.panel}>
        <h3>{t('documents')}</h3>
        <div className={styles.chips}>{negotiation.documents?.map((item) => <span key={item}><HydroIcon name="document" size={16} />{translateMock(locale, item)}</span>)}</div>
      </Card>
      <Card className={styles.panel}>
        <h3>{t('history')}</h3>
        <ol className={styles.steps}>{negotiation.history?.map((event) => <li key={event.title}><span className={styles.dot}><HydroIcon name="check" size={15} /></span><div><strong>{translateMock(locale, event.title)}</strong><p>{translateMock(locale, event.description)}</p></div><time>{translateMock(locale, formatMockDate(locale, event.date))}</time></li>)}</ol>
      </Card>
    </section>
  );
}

import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { NegotiationBoard } from '@/features/negotiations/components/negotiation-board/negotiation-board';
import { listNegotiations } from '@/features/marketplace/services/marketplace.service';

export default async function NegotiationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.negotiations' });
  const negotiations = await listNegotiations();

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <NegotiationBoard negotiations={negotiations} locale={locale} />
    </PageShell>
  );
}

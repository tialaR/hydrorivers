import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview/dashboard-overview';
import { NegotiationBoard } from '@/features/negotiations/components/negotiation-board/negotiation-board';
import { listNegotiations } from '@/features/marketplace/services/marketplace.service';

export default async function DashboardPage() {
  const t = await getTranslations('pages.dashboard');
  const negotiations = await listNegotiations();

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <DashboardOverview />
      <div style={{ height: '1rem' }} />
      <NegotiationBoard negotiations={negotiations} />
    </PageShell>
  );
}

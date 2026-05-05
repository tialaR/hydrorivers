import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview/dashboard-overview';
import { NegotiationBoard } from '@/features/negotiations/components/negotiation-board/negotiation-board';
import { listNegotiations } from '@/features/marketplace/services/marketplace.service';
import { getSessionUser } from '@/shared/server/auth';

export default async function DashboardPage() {
  const t = await getTranslations('pages.dashboard');
  const negotiations = await listNegotiations();
  const user = await getSessionUser();
  const showMyCargoes = Boolean(user && (user.role === 'shipper' || user.role === 'carrier'));

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      {showMyCargoes ? (
        <p style={{ marginBottom: '1rem' }}>
          <Link href={intlAppPaths.cargos.myCargos}>{t('myCargoesCta')}</Link>
        </p>
      ) : null}
      <DashboardOverview />
      <div style={{ height: '1rem' }} />
      <NegotiationBoard negotiations={negotiations} />
    </PageShell>
  );
}

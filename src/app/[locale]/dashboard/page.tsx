import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview/dashboard-overview';
import { NegotiationBoard } from '@/features/negotiations/components/negotiation-board/negotiation-board';
import { listNegotiations } from '@/features/marketplace/services/marketplace.service';
import { getSessionUser } from '@/shared/server/auth';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.dashboard' });
  const negotiations = await listNegotiations();
  const user = await getSessionUser();
  const showMyCargoes = Boolean(user && (user.role === 'shipper' || user.role === 'carrier'));

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      {showMyCargoes ? (
        <p style={{ marginBottom: '1rem' }}>
          <Link locale={locale} href={intlAppPaths.cargos.myCargos}>
            {t('myCargoesCta')}
          </Link>
        </p>
      ) : null}
      <DashboardOverview locale={locale} />
      <div style={{ height: '1rem' }} />
      <NegotiationBoard negotiations={negotiations} locale={locale} />
    </PageShell>
  );
}

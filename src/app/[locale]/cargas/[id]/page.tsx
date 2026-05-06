import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { CargoDetailLoader } from '@/features/cargo-market/components/cargo-detail/cargo-detail-loader';
import { getCargoById } from '@/features/marketplace/services/marketplace.service';
import { getSessionUser } from '@/shared/server/auth';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { translateMock } from '@/shared/i18n/mock-content';

export default async function CargoDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const cargo = await getCargoById(id);
  if (!cargo) notFound();

  const user = await getSessionUser();
  const viewer = user ? { id: user.id, role: user.role, approved: user.approved } : null;
  const t = await getTranslations({ locale, namespace: 'pages.cargoDetail' });
  const nav = await getTranslations({ locale, namespace: 'nav' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const title = translateMock(locale, cargo.title);
  const routeDescription = `${cargo.origin}${common('routeArrow')}${cargo.destination}`;

  return (
    <PageShell eyebrow={t('eyebrow')} title={title} description={routeDescription}>
      <Breadcrumb locale={locale} items={[{ label: nav('cargoes'), href: intlAppPaths.cargos.marketplace }, { label: title }]} />
      <CargoDetailLoader id={id} initialCargo={cargo} viewer={viewer} />
    </PageShell>
  );
}

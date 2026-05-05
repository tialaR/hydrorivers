import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { CargoDetailLoader } from '@/features/cargo-market/components/cargo-detail/cargo-detail-loader';
import { getCargoById } from '@/features/marketplace/services/marketplace.service';
import { getSessionUser } from '@/shared/server/auth';

export default async function CargoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cargo = await getCargoById(id);
  if (!cargo) notFound();

  const user = await getSessionUser();
  const viewer = user ? { id: user.id, role: user.role } : null;
  const t = await getTranslations('pages.cargoDetail');
  const nav = await getTranslations('nav');

  return (
    <PageShell eyebrow={t('eyebrow')} title={cargo.title} description={`${cargo.origin} → ${cargo.destination}`}>
      <Breadcrumb items={[{ label: nav('cargoes'), href: '/cargas' }, { label: cargo.title }]} />
      <CargoDetailLoader id={id} initialCargo={cargo} viewer={viewer} />
    </PageShell>
  );
}

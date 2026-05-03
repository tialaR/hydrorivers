import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { CargoDetailLoader } from '@/features/cargo-market/components/cargo-detail/cargo-detail-loader';
import { getCargoById } from '@/features/marketplace/services/marketplace.service';

export default async function CargoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cargo = await getCargoById(id);
  const t = await getTranslations('pages.cargoDetail');
  const nav = await getTranslations('nav');

  return (
    <PageShell eyebrow={t('eyebrow')} title={cargo?.title ?? t('fallbackTitle')} description={cargo ? `${cargo.origin} → ${cargo.destination}` : t('fallbackDescription')}>
      <Breadcrumb items={[{ label: nav('cargoes'), href: '/cargas' }, { label: cargo?.title ?? id }]} />
      <CargoDetailLoader id={id} initialCargo={cargo} />
    </PageShell>
  );
}

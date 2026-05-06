import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { CargoList } from '@/features/cargo-market/components/cargo-list/cargo-list';
import { listCargoes } from '@/features/marketplace/services/marketplace.service';

export default async function CargoesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.cargoes' });
  const cargoes = await listCargoes();

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <CargoList cargoes={cargoes} />
    </PageShell>
  );
}

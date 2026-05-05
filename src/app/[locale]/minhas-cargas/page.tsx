import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSessionUser } from '@/shared/server/auth';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { MyCargoesList } from '@/features/cargo-market/components/my-cargoes-list/my-cargoes-list';
import { listCargoes, listNegotiations } from '@/features/marketplace/services/marketplace.service';
import { filterMyCargoes } from '@/features/marketplace/services/my-cargoes.filters';

export default async function MinhasCargasPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const user = await getSessionUser();
  const t = await getTranslations('pages.minhasCargas');
  const nav = await getTranslations('nav');

  if (!user) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/minhas-cargas`)}`);
  }

  if (user.role === 'admin') {
    redirect(`/${locale}/admin`);
  }

  const [allCargoes, negotiations] = await Promise.all([listCargoes(), listNegotiations()]);
  const mine = filterMyCargoes(user, allCargoes, negotiations);

  const createdCargoId = typeof sp.created === 'string' && sp.created.trim() ? sp.created.trim() : undefined;

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <Breadcrumb items={[{ label: nav('dashboard'), href: '/dashboard' }, { label: t('breadcrumbCurrent') }]} />
      <MyCargoesList cargoes={mine} createdCargoId={createdCargoId} />
    </PageShell>
  );
}

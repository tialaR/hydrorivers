import { getTranslations } from 'next-intl/server';
import { NewCargoForm } from '@/features/cargo-market/components/new-cargo-form/new-cargo-form';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { intlAppPaths } from '@/shared/routing/app-routes';

type NewCargoPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewCargoPage({ params }: NewCargoPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.newCargo' });
  const nav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <PageShell
      namespace="pages.newCargo"
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
    >
      <Breadcrumb
        locale={locale}
        items={[
          { label: nav('cargoes'), href: intlAppPaths.cargos.marketplace },
          { label: t('breadcrumbCurrent') }
        ]}
      />
      <NewCargoForm />
    </PageShell>
  );
}

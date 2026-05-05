import { getTranslations } from 'next-intl/server';
import { NewCargoForm } from '@/features/cargo-market/components/new-cargo-form/new-cargo-form';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { intlAppPaths } from '@/shared/routing/app-routes';

export default async function NewCargoPage() {
  const t = await getTranslations('pages.newCargo');
  const nav = await getTranslations('nav');

  return <PageShell namespace="pages.newCargo"><Breadcrumb items={[{ label: nav('cargoes'), href: intlAppPaths.cargos.marketplace }, { label: t('breadcrumbCurrent') }]} /><NewCargoForm /></PageShell>;
}

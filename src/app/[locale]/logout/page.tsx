import { getTranslations } from 'next-intl/server';
import { LogoutPanel } from '@/features/auth/components/logout-panel/logout-panel';

export default async function LogoutPage() {
  const t = await getTranslations('pages.logout');
  return <LogoutPanel ariaLabel={t('mainAriaLabel')} />;
}

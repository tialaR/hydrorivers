import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { routing } from '@/core/i18n/routing';
import type { AppLocale } from '@/shared/routing/route-types';
import { appRoutes } from '@/shared/routing/app-routes';

export default async function RootPage() {
  const cookieStore = await cookies();
  const preferred = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = routing.locales.includes(preferred as (typeof routing.locales)[number])
    ? preferred
    : routing.defaultLocale;

  redirect(appRoutes.home(locale as AppLocale));
}

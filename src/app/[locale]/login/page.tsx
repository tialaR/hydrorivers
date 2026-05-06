import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { AuthForm } from '@/features/auth/components/auth-form/auth-form';

export default async function LoginPage() {
  const t = await getTranslations('pages.login');
  return (
    <Suspense fallback={<section aria-busy="true" aria-label={t('loading')} />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}

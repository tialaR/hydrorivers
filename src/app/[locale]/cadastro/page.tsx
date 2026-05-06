import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { AuthForm } from '@/features/auth/components/auth-form/auth-form';

export default async function RegisterPage() {
  const t = await getTranslations('pages.cadastro');
  return (
    <Suspense fallback={<section aria-busy="true" aria-label={t('loading')} />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}

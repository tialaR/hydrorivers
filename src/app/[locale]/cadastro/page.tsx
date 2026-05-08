import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { AuthForm } from '@/features/auth/components/auth-form/auth-form';

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' ? raw : undefined;
}

export default async function RegisterPage({
  searchParams
}: {
  searchParams?: Promise<{ prefill?: string | string[] }>;
}) {
  const sp = (await searchParams) ?? {};
  const prefill = firstSearchParam(sp.prefill);
  const t = await getTranslations('pages.cadastro');
  return (
    <Suspense fallback={<section aria-busy="true" aria-label={t('loading')} />}>
      <AuthForm mode="register" registerPrefill={prefill} />
    </Suspense>
  );
}

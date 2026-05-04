import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DevOnboardingDashboard } from '@/features/onboarding/components/dev-onboarding-dashboard/dev-onboarding-dashboard';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.devOnboarding' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

export default function DevOnboardingPage() {
  return <DevOnboardingDashboard />;
}

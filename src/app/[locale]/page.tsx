import { HydroHero } from '@/features/home/components/hydro-hero/hydro-hero';
import { ValuePillars } from '@/features/home/components/value-pillars/value-pillars';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  return (
    <>
      <HydroHero locale={locale} />
      <ValuePillars locale={locale} />
    </>
  );
}

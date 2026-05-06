import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Card } from '@/shared/ui/card/card';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { intlAppPaths } from '@/shared/routing/app-routes';

const impactIds = ['cost', 'sustainability', 'regional', 'automation', 'brdomar', 'compliance', 'connectivity', 'government'] as const;
type ImpactId = (typeof impactIds)[number];

function isImpactId(value: string): value is ImpactId {
  return impactIds.includes(value as ImpactId);
}

export default async function ImpactDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  if (!isImpactId(id)) notFound();

  const t = await getTranslations({ locale, namespace: `impactCards.${id}` });
  const page = await getTranslations({ locale, namespace: 'pages.impactDetail' });
  const details = page.raw(`details.${id}`) as string[];

  return (
    <PageShell eyebrow={page('eyebrow')} title={t('title')} description={t('description')}>
      <Breadcrumb
        locale={locale}
        items={[{ label: page('breadcrumb'), href: intlAppPaths.impact.home }, { label: t('title') }]}
      />
      <Card style={{ borderWidth: 3, display: 'grid', gap: '1rem' }}>
        <span style={{ color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontWeight: 600 }}><HydroIcon name="leaf" /> {page('kicker')}</span>
        <p style={{ color: 'var(--muted)', fontWeight: 560, lineHeight: 1.7 }}>{page('description')}</p>
        <ul style={{ display: 'grid', gap: '.7rem', margin: 0, paddingLeft: '1.2rem' }}>{details.map((item) => <li key={item}>{item}</li>)}</ul>
      </Card>
    </PageShell>
  );
}

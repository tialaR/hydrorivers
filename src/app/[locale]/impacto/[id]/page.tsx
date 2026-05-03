import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Card } from '@/shared/ui/card/card';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';

const impactIds = ['cost', 'sustainability', 'regional', 'automation', 'brdomar', 'compliance', 'connectivity', 'government'] as const;
type ImpactId = (typeof impactIds)[number];

function isImpactId(value: string): value is ImpactId {
  return impactIds.includes(value as ImpactId);
}

export default async function ImpactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isImpactId(id)) notFound();

  const t = await getTranslations(`impactCards.${id}`);
  const page = await getTranslations('pages.impactDetail');
  const details = page.raw(`details.${id}`) as string[];

  return (
    <PageShell eyebrow={page('eyebrow')} title={t('title')} description={t('description')}>
      <Breadcrumb items={[{ label: page('breadcrumb'), href: '/impacto' }, { label: t('title') }]} />
      <Card style={{ borderWidth: 3, display: 'grid', gap: '1rem' }}>
        <span style={{ color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontWeight: 600 }}><HydroIcon name="leaf" /> {page('kicker')}</span>
        <p style={{ color: 'var(--muted)', fontWeight: 560, lineHeight: 1.7 }}>{page('description')}</p>
        <ul style={{ display: 'grid', gap: '.7rem', margin: 0, paddingLeft: '1.2rem' }}>{details.map((item) => <li key={item}>{item}</li>)}</ul>
      </Card>
    </PageShell>
  );
}

import { AdminConsole } from '@/features/admin/components/admin-console/admin-console';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Card } from '@/shared/ui/card/card';
import { getSessionUser } from '@/shared/server/auth';
import { getTranslations } from 'next-intl/server';

export default async function AdminPage() {
  const user = await getSessionUser();
  const t = await getTranslations('pages.admin');

  if (user?.role !== 'admin') {
    return (
      <PageShell namespace="pages.admin">
        <Card style={{ borderWidth: 3 }} data-testid="admin-unauthorized">
          <h2>{t('unauthorizedTitle')}</h2>
          <p>{t('unauthorizedDescription')}</p>
        </Card>
      </PageShell>
    );
  }

  return <PageShell namespace="pages.admin"><AdminConsole /></PageShell>;
}

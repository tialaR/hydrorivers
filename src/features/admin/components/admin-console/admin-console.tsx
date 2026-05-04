import { AlertTriangle, CheckCircle2, ClipboardList, Ship, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/ui/card/card';
import { Badge } from '@/shared/ui/badge/badge';
import styles from './admin-console.module.scss';

const queues = [
  { labelKey: 'carriersForApproval', value: '5', icon: UsersRound, tone: 'warning' as const },
  { labelKey: 'openCargoes', value: '18', icon: ClipboardList, tone: 'river' as const },
  { labelKey: 'activeVessels', value: '11', icon: Ship, tone: 'success' as const },
  { labelKey: 'disputesUnderReview', value: '2', icon: AlertTriangle, tone: 'warning' as const }
];

const rows = [
  { company: 'Navega Norte', actionKey: 'approveDocs', tone: 'warning' as const, statusKey: 'pending' },
  { company: 'Coop. Açaí Pará', actionKey: 'validateProof', tone: 'river' as const, statusKey: 'underReview' },
  { company: 'Floresta Legal', actionKey: 'contractAudit', tone: 'success' as const, statusKey: 'ok' }
];

export function AdminConsole() {
  const t = useTranslations('pages.adminConsole');

  return (
    <section className={styles.grid} data-testid="admin-console">
      {queues.map((item) => {
        const Icon = item.icon;
        return (
          <Card className={styles.metric} key={item.labelKey}>
            <Icon />
            <span>{t(item.labelKey)}</span>
            <strong>{item.value}</strong>
            <Badge tone={item.tone}><CheckCircle2 size={14} /> {t('pilotPhase')}</Badge>
          </Card>
        );
      })}
      <Card className={styles.table}>
        <h2>{t('queueTitle')}</h2>
        {rows.map((row) => (
          <div className={styles.row} key={row.company}>
            <span>{row.company}</span>
            <strong>{t(row.actionKey)}</strong>
            <Badge tone={row.tone}>{t(row.statusKey)}</Badge>
          </div>
        ))}
      </Card>
    </section>
  );
}

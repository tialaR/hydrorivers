import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Card } from '@/shared/ui/card/card';
import styles from './dev-onboarding-dashboard.module.scss';

export async function DevOnboardingDashboard() {
  const t = await getTranslations('pages.devOnboarding');

  const levels = [
    t('level0'),
    t('level1'),
    t('level2'),
    t('level3'),
    t('level4'),
    t('level5'),
    t('level6'),
    t('level7')
  ];

  const commands = [
    t('cmdCheckOnboarding'),
    t('cmdLint'),
    t('cmdTypecheck'),
    t('cmdI18n'),
    t('cmdTest')
  ];

  const docs = [
    { path: t('docPathDeveloper'), hint: t('docHintDeveloper') },
    { path: t('docPathProgress'), hint: t('docHintProgress') },
    { path: t('docPathApiAudit'), hint: t('docHintApiAudit') },
    { path: t('docPathSecurity'), hint: t('docHintSecurity') },
    { path: t('docPathE2e'), hint: t('docHintE2e') }
  ];

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <div className={styles.grid} aria-label={t('mainAriaLabel')}>
        <Card>
          <h2 className={styles.cardTitle}>{t('levelsTitle')}</h2>
          <ol className={styles.levels}>
            {levels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ol>
        </Card>

        <Card>
          <h2 className={styles.cardTitle}>{t('commandsTitle')}</h2>
          <ul className={styles.listPlain}>
            {commands.map((cmd) => (
              <li key={cmd}>
                <code className={styles.code}>{cmd}</code>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className={styles.cardTitle}>{t('docsTitle')}</h2>
          <ul className={styles.listPlain}>
            {docs.map(({ path, hint }) => (
              <li key={path} className={styles.docRow}>
                <code className={styles.code}>{path}</code>
                <span className={styles.docHint}>{hint}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card role="note" aria-label={t('disclaimerAria')}>
          <p className={styles.disclaimer}>{t('disclaimer')}</p>
        </Card>
      </div>
    </PageShell>
  );
}

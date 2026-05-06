import { getLocale, getTranslations } from 'next-intl/server';
import styles from './page-shell.module.scss';

type PageShellProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  namespace?: string;
  /** Quando definido, garante `getTranslations` alinhado ao segmento `[locale]` (evita fallback para pt-BR no servidor). */
  locale?: string;
};

export async function PageShell({ children, eyebrow, title, description, namespace, locale }: PageShellProps) {
  let resolvedEyebrow = eyebrow;
  let resolvedTitle = title;
  let resolvedDescription = description;

  if (namespace && (!title || !description || !eyebrow)) {
    const effectiveLocale = locale ?? (await getLocale());
    const t = await getTranslations({ locale: effectiveLocale, namespace });
    resolvedEyebrow = resolvedEyebrow ?? t('eyebrow');
    resolvedTitle = resolvedTitle ?? t('title');
    resolvedDescription = resolvedDescription ?? t('description');
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        {resolvedEyebrow ? <p>{resolvedEyebrow}</p> : null}
        {resolvedTitle ? <h1>{resolvedTitle}</h1> : null}
        {resolvedDescription ? <span>{resolvedDescription}</span> : null}
      </header>
      {children}
    </main>
  );
}

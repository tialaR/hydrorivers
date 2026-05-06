import styles from '@/shared/ui/page-shell/page-shell.module.scss';

/**
 * Fallback de Suspense: sem textos — `getLocale`/`getTranslations` em `loading.tsx` podem cair no
 * locale padrão durante o streaming. Skeleton neutro evita flash em português em rotas en-US/es.
 */
export default function CargoesLoading() {
  const bar = (w: string, h: string, mt?: string) => ({
    display: 'block' as const,
    width: w,
    height: h,
    marginTop: mt,
    borderRadius: 8,
    background: 'color-mix(in srgb, var(--line) 75%, transparent)',
    opacity: 0.55
  });

  return (
    <main className={styles.shell} aria-busy="true">
      <header className={styles.header} aria-hidden="true">
        <p style={bar('6.5rem', '2rem')} />
        <h1 style={{ ...bar('min(560px, 88%)', '2.75rem', '.55rem'), borderRadius: 12 }} />
        <span style={{ ...bar('min(420px, 72%)', '1.15rem', '.85rem'), borderRadius: 6, opacity: 0.42 }} />
      </header>
      <div aria-live="polite" />
    </main>
  );
}

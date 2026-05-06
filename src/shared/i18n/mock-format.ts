function normalizeLocale(locale: string): 'pt-BR' | 'en-US' | 'es' {
  if (locale === 'pt-BR') return 'pt-BR';
  if (locale.startsWith('es')) return 'es';
  return 'en-US';
}

export function formatMockDate(locale: string, value?: string | null): string {
  if (!value) return '';
  const normalized = normalizeLocale(locale);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  if (normalized === 'pt-BR') {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed);
  }

  if (normalized === 'es') {
    return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
  }

  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
}

export function formatMockBrl(locale: string, value?: string | null): string {
  if (!value) return '';
  const normalized = normalizeLocale(locale);
  const match = value.match(/(\d[\d.,]*)/);
  if (!match) return value;

  const numeric = Number(match[1].replace(/\./g, '').replace(',', '.'));
  if (Number.isNaN(numeric)) return value;

  return new Intl.NumberFormat(normalized, {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(numeric);
}

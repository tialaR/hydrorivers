/**
 * Nomes estáveis de query string nas rotas da aplicação (não inclui params de segmento `[id]`).
 */
export const routeSearchParams = {
  next: 'next',
  created: 'created',
  page: 'page',
  scope: 'scope',
  locale: 'locale'
} as const;

export type RouteSearchParamKey = keyof typeof routeSearchParams;

export type RouteSearchParamValue = (typeof routeSearchParams)[RouteSearchParamKey];

/** Monta query string só com entradas definidas e não vazias. */
export function appendRouteSearchParams(
  pathname: string,
  partial: Partial<Record<RouteSearchParamValue, string | undefined>>
): string {
  const usp = new URLSearchParams();
  for (const [rawKey, rawVal] of Object.entries(partial)) {
    if (rawVal === undefined || rawVal === '') continue;
    usp.set(rawKey, rawVal);
  }
  const qs = usp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

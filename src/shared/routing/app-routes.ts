import type { AppLocale } from './route-types';
import { routeSearchParams } from './route-search-params';

/** Segmentos sem prefixo de locale (uso com next-intl Link / router + middleware). */
const intlSegments = {
  login: '/login',
  /** Cadastro — rota `[locale]/cadastro`. */
  cadastro: '/cadastro',
  perfil: '/perfil',
  dashboard: '/dashboard',
  cargasRoot: '/cargas',
  minhasCargas: '/minhas-cargas',
  cargasNova: '/cargas/nova',
  admin: '/admin',
  negociacoes: '/negociacoes',
  rastreio: '/rastreio',
  embarcacoes: '/embarcacoes',
  impacto: '/impacto',
  governo: '/governo'
} as const;

/**
 * Monta caminho absoluto com locale (`/{locale}/...`) para `redirect()` do Next,
 * `revalidatePath`, `window.location`, URLs completas em E2E, etc.
 */
export function localizedAppPath(locale: AppLocale, pathname: string): string {
  if (pathname === '/') return `/${locale}`;
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `/${locale}${normalized}`;
}

/**
 * Rotas relativas ao segmento `[locale]` (sem repetir `/${locale}`).
 * Use em `Link`, `router.push` e na lista de rotas privadas do middleware.
 */
export const intlAppPaths = {
  home: '/',
  auth: {
    login: intlSegments.login,
    register: intlSegments.cadastro,
    profile: intlSegments.perfil
  },
  dashboard: {
    home: intlSegments.dashboard
  },
  cargos: {
    marketplace: intlSegments.cargasRoot,
    myCargos: intlSegments.minhasCargas,
    publishCargo: intlSegments.cargasNova,
    cargoDetail: (cargoId: string) => `${intlSegments.cargasRoot}/${cargoId}`
  },
  admin: {
    home: intlSegments.admin
  },
  negotiations: {
    home: intlSegments.negociacoes
  },
  tracking: {
    home: intlSegments.rastreio
  },
  vessels: {
    marketplace: intlSegments.embarcacoes,
    vesselDetail: (vesselId: string) => `${intlSegments.embarcacoes}/${vesselId}`
  },
  impact: {
    home: intlSegments.impacto
  },
  government: {
    home: intlSegments.governo
  }
} as const;

/** Rotas que exigem cookie `hydrorivers_session` (mesma ordem semântica que `middleware.ts`). */
export const middlewarePrivateIntlPaths: readonly string[] = [
  intlAppPaths.dashboard.home,
  intlAppPaths.cargos.publishCargo,
  intlAppPaths.auth.profile,
  intlAppPaths.negotiations.home,
  intlAppPaths.tracking.home,
  intlAppPaths.admin.home
];

export const appRoutes = {
  home: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.home),
  auth: {
    login: (locale: AppLocale, nextAbsolutePath?: string) => {
      const base = localizedAppPath(locale, intlAppPaths.auth.login);
      if (!nextAbsolutePath) return base;
      return `${base}?${routeSearchParams.next}=${encodeURIComponent(nextAbsolutePath)}`;
    },
    register: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.auth.register),
    profile: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.auth.profile)
  },
  dashboard: {
    home: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.dashboard.home)
  },
  cargos: {
    marketplace: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.cargos.marketplace),
    myCargos: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.cargos.myCargos),
    publishCargo: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.cargos.publishCargo),
    cargoDetail: (locale: AppLocale, cargoId: string) =>
      localizedAppPath(locale, intlAppPaths.cargos.cargoDetail(cargoId))
  },
  admin: {
    home: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.admin.home)
  },
  negotiations: {
    home: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.negotiations.home)
  },
  tracking: {
    home: (locale: AppLocale) => localizedAppPath(locale, intlAppPaths.tracking.home)
  }
} as const;

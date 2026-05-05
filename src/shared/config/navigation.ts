import { intlAppPaths } from '@/shared/routing/app-routes';

export const mainNavigation = [
  { href: intlAppPaths.home, labelKey: 'home' },
  { href: intlAppPaths.dashboard.home, labelKey: 'dashboard' },
  { href: intlAppPaths.cargos.marketplace, labelKey: 'cargoes' },
  { href: intlAppPaths.cargos.myCargos, labelKey: 'myCargoes' },
  { href: intlAppPaths.vessels.marketplace, labelKey: 'vessels' },
  { href: intlAppPaths.negotiations.home, labelKey: 'negotiations' },
  { href: intlAppPaths.tracking.home, labelKey: 'tracking' },
  { href: intlAppPaths.impact.home, labelKey: 'impact' },
  { href: intlAppPaths.government.home, labelKey: 'government' },
  { href: intlAppPaths.admin.home, labelKey: 'admin' }
] as const;

import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from '@/core/i18n/routing';
import { middlewarePrivateIntlPaths } from '@/shared/routing/app-routes';
import { routeSearchParams } from '@/shared/routing/route-search-params';
import { cookieNames } from '@/shared/http/cookie-names';

const intlMiddleware = createMiddleware(routing);

const localeSegmentSet = new Set<string>(routing.locales);

function pathnameWithoutLocale(pathname: string): { locale: string; pathnameWithoutLocale: string } | null {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (!first || !localeSegmentSet.has(first)) return null;
  const tail = segments.slice(1).join('/');
  const pathnameWithoutLocale = tail ? `/${tail}` : '/';
  return { locale: first, pathnameWithoutLocale };
}

function isPrivatePath(pathnameWithoutLocale: string): boolean {
  return middlewarePrivateIntlPaths.some(
    (prefix) =>
      pathnameWithoutLocale === prefix ||
      (prefix !== '/' && pathnameWithoutLocale.startsWith(`${prefix}/`))
  );
}

export function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;
  const parsed = pathnameWithoutLocale(pathname);

  if (!parsed) {
    return intlResponse;
  }

  if (!isPrivatePath(parsed.pathnameWithoutLocale)) {
    return intlResponse;
  }

  if (request.cookies.get(cookieNames.session)?.value) {
    return intlResponse;
  }

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  const loginUrl = new URL(`/${parsed.locale}/login`, request.url);
  loginUrl.searchParams.set(routeSearchParams.next, pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

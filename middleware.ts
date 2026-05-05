import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './src/core/i18n/routing';
import { cookieNames } from './src/shared/http/cookie-names';
import { intlAppPaths, middlewarePrivateIntlPaths } from './src/shared/routing/app-routes';
import { routeSearchParams } from './src/shared/routing/route-search-params';

const intlMiddleware = createMiddleware(routing);

const privateRoutes = middlewarePrivateIntlPaths;

function getLocaleAndPath(pathname: string) {
  const match = pathname.match(/^\/(pt-BR|en|es)(\/.*)?$/);
  if (!match) return { locale: routing.defaultLocale, localizedPath: pathname };
  return { locale: match[1], localizedPath: match[2] || '/' };
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, localizedPath } = getLocaleAndPath(pathname);
  const isPrivate = privateRoutes.some((route) => localizedPath === route || localizedPath.startsWith(`${route}/`));

  if (isPrivate && !request.cookies.get(cookieNames.session)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${intlAppPaths.auth.login}`;
    url.searchParams.set(routeSearchParams.next, pathname);
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(pt-BR|en|es)/:path*']
};

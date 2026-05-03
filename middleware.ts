import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './src/core/i18n/routing';

const intlMiddleware = createMiddleware(routing);

const privateRoutes = [
  '/dashboard',
  '/cargas/nova',
  '/perfil',
  '/negociacoes',
  '/rastreio',
  '/admin'
];

function getLocaleAndPath(pathname: string) {
  const match = pathname.match(/^\/(pt-BR|en|es)(\/.*)?$/);
  if (!match) return { locale: routing.defaultLocale, localizedPath: pathname };
  return { locale: match[1], localizedPath: match[2] || '/' };
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, localizedPath } = getLocaleAndPath(pathname);
  const isPrivate = privateRoutes.some((route) => localizedPath === route || localizedPath.startsWith(`${route}/`));

  if (isPrivate && !request.cookies.get('hydrorivers_session')?.value) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(pt-BR|en|es)/:path*']
};

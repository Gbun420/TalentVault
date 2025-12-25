import { NextResponse } from 'next/server';

const protectedRoutes = ['/hq', '/jobs', '/candidates', '/analytics', '/settings', '/companies'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get('tv_jwt')?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/hq/:path*', '/jobs/:path*', '/candidates/:path*', '/analytics/:path*', '/settings/:path*', '/companies/:path*'],
};

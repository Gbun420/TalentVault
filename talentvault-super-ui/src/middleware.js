import { NextResponse } from 'next/server';

const protectedRoutes = ['/hq', '/jobs', '/candidates', '/analytics', '/settings', '/companies', '/talent'];
const employerRoutes = ['/hq', '/jobs', '/candidates', '/analytics', '/companies'];
const jobSeekerRoutes = ['/talent'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get('tv_jwt')?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    const portalHint = pathname.startsWith('/talent') ? 'jobseeker' : 'employer';
    url.pathname = '/login';
    url.searchParams.set('portal', portalHint);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const portal = request.cookies.get('tv_portal')?.value || 'employer';
  const isJobSeeker = portal === 'jobseeker';

  if (isJobSeeker && employerRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/talent';
    return NextResponse.redirect(url);
  }

  if (!isJobSeeker && jobSeekerRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/hq';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/hq/:path*',
    '/jobs/:path*',
    '/candidates/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/companies/:path*',
    '/talent/:path*',
  ],
};

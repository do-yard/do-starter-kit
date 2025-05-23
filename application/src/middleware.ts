import { auth } from 'lib/auth';
import { NextResponse, NextRequest } from 'next/server';
import { UserRole } from 'types';

export const ROLE_HOME_URL: Record<UserRole, string> = {
  USER: '/dashboard',
  ADMIN: '/dashboard',
};

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role as UserRole | undefined;

  if (pathname === '/' && isLoggedIn && userRole) {
    const home = ROLE_HOME_URL[userRole] ?? '/dashboard';
    const redirectUrl = new URL(home, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
    const rootUrl = new URL('/', request.url);
    return NextResponse.redirect(rootUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/signup', '/dashboard/:path*'],
};

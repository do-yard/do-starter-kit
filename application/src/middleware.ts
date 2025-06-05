import { NextResponse, NextRequest } from 'next/server';
import { auth } from 'lib/auth/auth';
import { UserRole } from 'types';
import { USER_ROLES } from 'lib/auth/roles';
import { StatusService } from './services/status/statusService';

const ROLE_HOME_URL: Record<UserRole, string> = {
  [USER_ROLES.USER]: '/dashboard',
  [USER_ROLES.ADMIN]: '/dashboard',
};

/**
 * Middleware to handle authentication and role-based redirects.
 * @returns A NextResponse object for redirection or continuation.
 */
export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isLoggedIn = !!session?.user;
  const role = session?.user?.role as UserRole;
  // Public routes that don't require storage configuration check
  const publicPaths = [
    '/system-status',
    '/api/system-status',
    '/api/health',
    '/login',
    '/signup',
    '/_next',
    '/favicon.ico'
  ];  // Skip configuration check for public routes and API endpoints
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  const isApiPath = pathname.startsWith('/api/') && !pathname.startsWith('/api/system-status');
  // Check service health for protected routes
  const isProtectedRoute = !isPublicPath && !isApiPath;
  if (isProtectedRoute) {
    // Skip health checks in edge runtime to avoid Prisma client issues
    // Edge runtime doesn't have access to Node.js APIs needed for database connections
    const isEdgeRuntime = typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge';
    
    if (!isEdgeRuntime) {
      // Ensure StatusService is initialized
      await StatusService.initialize();
      
      // Use cached health state for fast performance
      const isHealthy = StatusService.isApplicationHealthy();
      
      if (!isHealthy) {
        console.log(`Redirecting to system status due to unhealthy services for route: ${pathname}`);
        return NextResponse.redirect(new URL('/system-status', request.url));
      }
    } else {
      console.log(`Skipping health checks in edge runtime for route: ${pathname}`);
    }
  }

  if (pathname === '/' && isLoggedIn && role) {
    return NextResponse.redirect(new URL(ROLE_HOME_URL[role], request.url));
  }

  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoggedIn && role && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL(ROLE_HOME_URL[role] ?? '/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login', 
    '/signup',
    '/dashboard', 
    '/dashboard/:path*',
    '/system-status',
    '/api/system-status',
    '/api/health'
  ],
};

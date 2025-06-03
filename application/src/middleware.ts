import { NextResponse, NextRequest } from 'next/server';
import { auth } from 'lib/auth/auth';
import { UserRole } from 'types';
import { USER_ROLES } from 'lib/auth/roles';
// Update the import path if your settings file is located elsewhere, for example:
import { serverConfig } from '../settings';
// Or, if the file does not exist, create 'settings.ts' in the same directory with the following content:
// export const serverConfig = { storageProvider: '', Spaces: { accessKey: '', secretKey: '', bucketName: '', endpoint: '', region: '' } };

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
  ];

  // Skip configuration check for public routes and API endpoints
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  const isApiPath = pathname.startsWith('/api/') && !pathname.startsWith('/api/system-status');
  
  // Check storage config only for protected routes that require storage
  const isProtectedRoute = !isPublicPath && !isApiPath;

  if (isProtectedRoute) {
    // Check if storage provider is properly configured
    const storageProvider = serverConfig.storageProvider;
    
    // Check based on the storage provider type
    let isStorageConfigured = false;
    
    if (storageProvider === 'Spaces') {
      const spacesConfig = serverConfig.Spaces;
      isStorageConfigured = !!(
        spacesConfig.accessKey &&
        spacesConfig.secretKey &&
        spacesConfig.bucketName &&
        spacesConfig.endpoint &&
        spacesConfig.region
      );
    }
    // Add logic for other storage providers here when implemented
    
    if (!isStorageConfigured) {
      return NextResponse.redirect(new URL('/system-status', request.url));
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

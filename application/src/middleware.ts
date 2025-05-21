import { auth } from 'lib/auth';
import { NextResponse } from 'next/server';

export async function middleware(request: Request) {
  const session = await auth();

  if (!session?.user) {
    const loginUrl = new URL('/login', request.url);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

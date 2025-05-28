import { auth } from 'lib/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse, HTTP_STATUS } from '../api/http';
import { UserRole } from 'types';

export type WithAuthOptions = {
  allowedRoles?: UserRole[];
};

type Handler = (req: NextRequest, user: { id: string; role: UserRole }) => Promise<Response>;

/**
 * Higher-order function to wrap API route handlers with authentication and optional role-based authorization.
 * @param options Optional configuration for allowed user roles.
 */
export const withAuth =
  (handler: Handler, options: WithAuthOptions = {}) =>
  async (req: NextRequest): Promise<Response> => {
    try {
      const session = await auth();

      if (!session || !session.user?.id || !session.user?.role) {
        const res: ErrorResponse = { error: 'Unauthorized' };
        return NextResponse.json(res, { status: HTTP_STATUS.UNAUTHORIZED });
      }

      const { id, role } = session.user;

      if (options.allowedRoles && !options.allowedRoles.includes(role)) {
        const res: ErrorResponse = { error: 'Forbidden' };
        return NextResponse.json(res, { status: HTTP_STATUS.FORBIDDEN });
      }

      return await handler(req, { id, role });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Auth error:', error.message);
      } else {
        console.error('Unknown auth error:', error);
      }

      const res: ErrorResponse = { error: 'Internal server error' };
      return NextResponse.json(res, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
  };

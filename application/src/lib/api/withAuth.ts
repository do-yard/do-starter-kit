import { auth } from 'lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export type WithAuthOptions = {
  allowedRoles?: string[];
};

type Handler = (req: NextRequest, user: { id: string; role: string }) => Promise<Response>;

export const withAuth =
  (handler: Handler, options: WithAuthOptions = {}) =>
  async (req: NextRequest): Promise<Response> => {
    try {
      const session = await auth();

      if (!session || !session.user?.id || !session.user?.role) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { id, role } = session.user;

      if (options.allowedRoles && !options.allowedRoles.includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return await handler(req, { id, role });
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

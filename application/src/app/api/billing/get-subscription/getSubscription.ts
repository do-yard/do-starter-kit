import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from 'services/database/database';

export const getSubscription = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    const db = createDatabaseClient();
    const subscription = await db.subscription.findByUserAndStatus(user.id, 'ACTIVE');

    return NextResponse.json({ subscription: subscription });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

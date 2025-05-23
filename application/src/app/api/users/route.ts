import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { createDatabaseClient } from 'services/database/database';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dbClient = createDatabaseClient();
    const users = await dbClient.user.findAll();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admins to edit users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Only allow updating specific fields (e.g., name, email, role)
    const allowedFields = ['name', 'role', 'subscriptions'];
    // Remove fields from updateData that are not allowed
    Object.keys(updateData).forEach((key) => {
      if (!allowedFields.includes(key)) {
      delete updateData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const dbClient = createDatabaseClient();
    const updatedUser = await dbClient.user.update(id, {
      name: updateData.name,
      role: updateData.role,
    });

    if (updateData.subscriptions) {
      const userSubscriptions = await dbClient.subscription.findByUserId(id);  
      await dbClient.subscription.update(userSubscriptions[0].id, updateData.subscriptions[0]);
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
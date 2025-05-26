import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../lib/auth';
import { createDatabaseClient } from 'services/database/database';
import { RouteHandler, User } from 'types';

const getHandler: RouteHandler = async (request: NextRequest) => {
  try {
    const dbClient = createDatabaseClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchName = searchParams.get('searchName') || undefined;
    const filterPlan = searchParams.get('filterPlan') || undefined;
    const filterStatus = searchParams.get('filterStatus') || undefined;
    const { users, total } = await dbClient.user.findAll({ page, pageSize, searchName, filterPlan, filterStatus });
    return NextResponse.json({ users, total });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const patchHandler: RouteHandler = async (request: NextRequest) => {
  try {
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

export const GET = withAuth(getHandler, { requiredRole: 'ADMIN' });

export const PATCH = withAuth(patchHandler, { requiredRole: 'ADMIN' });
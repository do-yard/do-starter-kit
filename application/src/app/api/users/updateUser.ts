import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from 'services/database/database';

/**
 * Updates a user with the provided data in the request body.
 * Only allows updating specific fields: name, role, and subscriptions.
 *
 * @param request - The Next.js request object containing user update data.
 * @returns A NextResponse with the updated user or an error message.
 */
export const updateUser = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Only allow updating specific fields (e.g., name, email, role)
    const allowedFields = ['name', 'role', 'subscription'];

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

    if (updateData.subscription) {
      const userSubscriptions = await dbClient.subscription.findByUserId(id);
      await dbClient.subscription.update(id, updateData.subscription);
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

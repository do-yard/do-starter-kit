import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from 'services/database/database';

/**
 * Fetches all notes for the authenticated user.
 * @param request - The request object
 * @param user - The user object
 * @returns A list of notes for the user
 */
export const getAllNotes = async (
  request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> => {
  try {
    const userId = user.id;
    const dbClient = createDatabaseClient();

    const notes = await dbClient.note.findByUserId(userId);

    return NextResponse.json(notes, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

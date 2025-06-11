import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Create a new note
 * @param request - The request object
 * @param user - The user object
 * @returns The created note
 */
export const createNote = async (
  request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> => {
  try {
    const userId = user.id;
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const dbClient = await createDatabaseService();

    const note = await dbClient.note.create({
      userId,
      title,
      content,
    });

    return NextResponse.json(note, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

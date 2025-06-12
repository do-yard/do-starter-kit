import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from 'services/database/database';

/**
 * Fetches all notes for the authenticated user.
 * @param request - The request object with pagination
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

    // Parse pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search')?.trim();
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Get all notes for the user
    const [notes, total] = await Promise.all([
      dbClient.note.findMany({
        userId,
        search,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy:
          sortBy === 'title'
            ? { title: 'asc' as const }
            : sortBy === 'oldest'
              ? { createdAt: 'asc' as const }
              : { createdAt: 'desc' as const },
      }),
      dbClient.note.count(userId, search),
    ]);

    // Return both notes and total count
    return NextResponse.json({ notes, total }, { status: HTTP_STATUS.OK });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

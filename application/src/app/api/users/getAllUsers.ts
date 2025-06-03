import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from 'services/database/database';

/**
 * Handles the retrieval of all users with optional pagination and filtering.
 *
 * @param request - The Next.js request object containing query parameters for pagination and filtering.
 * @returns A NextResponse containing the list of users and the total count.
 */
export const getAllUsers = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const dbClient = createDatabaseClient();

    const { searchParams } = new URL(request.url);

    let page = parseInt(searchParams.get('page') || '1', 10);
    if (isNaN(page) || page < 1) page = 1;

    let pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    if (isNaN(pageSize) || pageSize < 1) pageSize = 10;

    const searchName = searchParams.get('searchName') || undefined;
    const filterPlan = searchParams.get('filterPlan') || undefined;
    const filterStatus = searchParams.get('filterStatus') || undefined;

    const { users, total } = await dbClient.user.findAll({
      page,
      pageSize,
      searchName,
      filterPlan,
      filterStatus,
    });
    return NextResponse.json({ users, total });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

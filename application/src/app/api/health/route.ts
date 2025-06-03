import { NextResponse } from 'next/server';

/**
 * Handles GET requests for the health endpoint.
 * @returns {NextResponse} JSON response with status 'ok'.
 */
export const GET = () => {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
};

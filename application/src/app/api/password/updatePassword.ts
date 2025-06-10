import {} from 'services/database/database';
import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword } from 'helpers/hash';
import { HTTP_STATUS } from 'lib/api/http';
import {
  EmptyCurrentPasswordError,
  EmptyNewPasswordError,
  EmptyConfirmNewPasswordError,
  NewPasswordsDoNotMatchError,
  UserDoesNotExistError,
  IncorrectCurrentPasswordError,
} from 'lib/auth/errors';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Updates the user's password.
 *
 * @param user - The user object containing id and role.
 */
export const updatePassword = async (
  request: NextRequest,
  user: { id: string; role: string }
): Promise<Response> => {
  try {
    const formData = await request.formData();
    const currentPassword = formData.get('currentPassword') as string | null;
    const newPassword = formData.get('newPassword') as string | null;
    const confirmNewPassword = formData.get('confirmNewPassword') as string | null;

    if (currentPassword === '') {
      return NextResponse.json(
        { error: new EmptyCurrentPasswordError().code },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (newPassword === '') {
      return NextResponse.json(
        { error: new EmptyNewPasswordError().code },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (confirmNewPassword === '') {
      return NextResponse.json(
        { error: new EmptyConfirmNewPasswordError().code },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { error: new NewPasswordsDoNotMatchError().code },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const db = await createDatabaseService();
    const dbUser = await db.user.findById(user.id);

    if (!dbUser) {
      return NextResponse.json(
        { error: new UserDoesNotExistError().code },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const isValid = await verifyPassword(currentPassword as string, dbUser.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: new IncorrectCurrentPasswordError().code },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const hashedPassword = await hashPassword(newPassword as string);
    dbUser.passwordHash = hashedPassword;

    await db.user.update(dbUser.id, dbUser);

    return NextResponse.json(
      { name: dbUser.name, image: dbUser.image },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error(
      'Error updating password:',
      error instanceof Error ? `${error.name}: ${error.message}` : error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

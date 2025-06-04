import { getFileNameFromUrl } from 'helpers/fileName';
import { createDatabaseClient } from 'services/database/database';
import { createStorageService } from 'services/storage/storage';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Updates the user's profile information, including name and profile image.
 *
 * @param user - The user object containing id and role.
 */
export const updateUserProfile = async (
  request: NextRequest,
  user: { id: string; role: string }
): Promise<Response> => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const newName = formData.get('name') as string | null;

    if (newName === '') {
      return NextResponse.json({ error: 'Name invalid' }, { status: 400 });
    }

    const db = createDatabaseClient();
    const dbUser = await db.user.findById(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User doesn't exist" }, { status: 404 });
    }

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Only JPG or PNG files are allowed' }, { status: 400 });
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'File size must be 5MB or less' }, { status: 400 });
      }

      const extension = file.name.includes('.')
        ? file.name.substring(file.name.lastIndexOf('.'))
        : '';
      const fileName = `${uuidv4()}${extension}`;

      const storageService = createStorageService();
      const uploadedFileName = await storageService.uploadFile(user.id, fileName, file, {
        ACL: 'public-read',
      });

      const fileUrl = (await storageService.getFileUrl(user.id, uploadedFileName)).split('?')[0];
      const oldImageName = getFileNameFromUrl(dbUser.image);

      if (oldImageName) {
        await storageService.deleteFile(user.id, oldImageName);
      }

      dbUser.image = fileUrl;
    }

    if (newName !== null) {
      dbUser.name = newName;
    }

    await db.user.update(dbUser.id, dbUser);

    return NextResponse.json({ name: dbUser.name, image: dbUser.image }, { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error instanceof Error ? `${error.name}: ${error.message}` : error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

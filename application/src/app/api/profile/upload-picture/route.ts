import { getFileNameFromUrl } from 'helpers/fileName';
import { auth } from 'lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from 'services/database/database';
import { createStorageService } from 'services/storage/storage';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get userId from authjs session
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storageService = createStorageService();

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG or PNG files are allowed' }, { status: 400 });
    }

    // Check file size: max 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be 5MB or less' }, { status: 400 });
    }

    const extension = file.name.includes('.')
      ? file.name.substring(file.name.lastIndexOf('.'))
      : '';
    const fileName = `${uuidv4()}${extension}`;

    const db = createDatabaseClient();
    const dbUser = await db.user.findById(userId);

    if (!dbUser) {
      return NextResponse.json({ error: "User doesn't exist" }, { status: 404 });
    }
    // Upload the file
    try {
      const uploadedFileName = await storageService.uploadFile(userId, fileName, file, {
        ACL: 'public-read',
      });
      const fileUrl = await storageService.getFileUrl(userId, uploadedFileName);

      const oldImageName = getFileNameFromUrl(dbUser.image);

      if (oldImageName) {
        await storageService.deleteFile(userId, oldImageName);
      }

      dbUser.image = fileUrl;

      await db.user.update(dbUser.id, dbUser);

      return NextResponse.json({ name: uploadedFileName, url: fileUrl }, { status: 200 });
    } catch (error) {
      console.error('File upload error:', error);
      return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

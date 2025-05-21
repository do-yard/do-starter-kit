import { NextRequest, NextResponse } from 'next/server';
import { createStorageService } from 'services/storage/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const userId = "testUserId"; // Replace with actual auth logic
    const storageService = createStorageService();

    // Upload the file
    const fileName = await storageService.uploadFile(userId, file);
    const fileUrl = await storageService.getFileUrl(userId, fileName);

    return NextResponse.json({ name: fileName, url: fileUrl });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
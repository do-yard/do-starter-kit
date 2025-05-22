import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseClient } from '../../../../services/database/database';
import { auth } from '../../../../lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: noteId } = await params;
    const userId = session.user.id;
    const dbClient = createDatabaseClient();

    const note = await dbClient.note.findById(noteId);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(note, { status: 200 });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: noteId } = await params;
    const userId = session.user.id;
    const { title, content } = await request.json();
    const dbClient = createDatabaseClient();

    if (!title && !content) {
      return NextResponse.json(
        { error: 'At least one field (title or content) is required' },
        { status: 400 }
      );
    }

    const existingNote = await dbClient.note.findById(noteId);

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (existingNote.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedNote = await dbClient.note.update(noteId, {
      title,
      content,
    });

    return NextResponse.json(updatedNote, { status: 200 });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: noteId } = await params;
    const userId = session.user.id;
    const dbClient = createDatabaseClient();

    const existingNote = await dbClient.note.findById(noteId);

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (existingNote.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbClient.note.delete(noteId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}

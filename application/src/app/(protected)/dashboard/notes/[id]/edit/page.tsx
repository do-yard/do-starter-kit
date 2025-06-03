'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import NoteEdit from 'components/notes/NoteEdit';
import { NotesApiClient } from 'lib/api/notes';

/**
 * EditNotePage component
 * This component retrieves the note ID from the URL parameters and renders the NoteEdit component.
 * @returns EditNotePage component
 */
const EditNotePage = () => {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const apiClient = new NotesApiClient();

  const handleSave = async (note: { id: string; title: string; content: string }) => {
    try {
      await apiClient.updateNote(note.id, { title: note.title, content: note.content });
      router.push('/dashboard/my-notes');
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/my-notes');
  };

  return <NoteEdit noteId={noteId} onSave={handleSave} onCancel={handleCancel} />;
};

export default EditNotePage;

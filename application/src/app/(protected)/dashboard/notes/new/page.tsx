'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CreateNote from 'components/notes/CreateNote';
import { NotesApiClient } from 'lib/api/NotesApiClient';

const CreateNotePage = () => {
  const router = useRouter();
  const apiClient = new NotesApiClient();

  const handleSave = async (note: { title: string; content: string }) => {
    try {
      await apiClient.createNote({
        title: note.title,
        content: note.content,
      });

      router.push('/dashboard/my-notes');
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/my-notes');
  };

  return <CreateNote onSave={handleSave} onCancel={handleCancel} />;
};

export default CreateNotePage;

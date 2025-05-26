'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from 'lib/apiClient';
import CreateNote from 'components/notes/CreateNote';

const CreateNotePage = () => {
  const router = useRouter();
  const apiClient = new ApiClient();

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

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import NoteDetail from 'components/notes/NoteDetails';

/**
 * NotePage component
 * This component retrieves the note ID from the URL parameters and renders the NoteDetail component.
 * @returns NotePage component
 */
const NotePage = () => {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const handleBack = () => {
    router.push('/dashboard/notes');
  };

  return <NoteDetail noteId={noteId} onBack={handleBack} />;
};

export default NotePage;

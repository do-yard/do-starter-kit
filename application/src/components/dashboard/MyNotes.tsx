'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
} from '@mui/material';
import { Note, NotesApiClient } from 'lib/api/notes';
import NoteForm from '../notes/NoteForm';
import NotesGridView from '../notes/NotesGridView';
import NotesListView from '../notes/NotesListView';
import NotesHeader from '../notes/NotesHeader';
import PageContainer from '../common/PageContainer';

// Create an instance of the ApiClient
const apiClient = new NotesApiClient();

/**
 * MyNotes component
 * This component displays a list of notes with options to view, edit, and create new notes.
 */
const MyNotes: React.FC = () => {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Fetch notes from API
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getNotes();
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const filteredNotes = notes
    .filter((note) => {
      const query = searchQuery.toLowerCase();
      return note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const handleSortChange = (
    event: ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    child: React.ReactNode
  ) => {
    setSortBy(event.target.value as string);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleEditStart = (noteId: string, title: string) => {
    setEditingNoteId(noteId);
    setEditedTitle(title);
  };

  const handleEditCancel = () => {
    setEditingNoteId(null);
    setEditedTitle('');
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(event.target.value);
  };

  const handleEditSave = async (noteId: string) => {
    try {
      const currentNote = notes.find((note) => note.id === noteId);

      if (!currentNote) {
        console.error('Note not found');
        return;
      }

      const updatedNote = await apiClient.updateNote(noteId, {
        title: editedTitle,
        content: currentNote.content,
      });

      const updatedNotes = notes.map((note) => {
        if (note.id === noteId) {
          return updatedNote;
        }
        return note;
      });

      setNotes(updatedNotes);
    } catch (err) {
      console.error('Error updating note:', err);
    } finally {
      setEditingNoteId(null);
      setEditedTitle('');
    }
  };

  const handleCreateNote = async (noteData: { title: string; content: string }) => {
    try {
      const newNote = await apiClient.createNote(noteData);
      setNotes([newNote, ...notes]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note. Please try again.');
    }
  };

  const handleUpdateNote = async (noteData: { title: string; content: string }) => {
    if (!selectedNoteId) return;
    
    try {
      const updatedNote = await apiClient.updateNote(selectedNoteId, noteData);
      setNotes(notes.map(note => note.id === selectedNoteId ? updatedNote : note));
      setIsEditModalOpen(false);
      setSelectedNoteId(null);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await apiClient.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    // Don't fetch notes here - only refresh when actual updates are made
  };

  const handleViewNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsViewModalOpen(true);
  };

  const handleEditNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsEditModalOpen(true);
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedNoteId(null);
  };  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedNoteId(null);
    // Don't fetch notes here - only refresh when actual updates are made
  };return (
    <PageContainer title="My Notes">
      {/* Header and Controls */}
      <NotesHeader
        searchQuery={searchQuery}
        sortBy={sortBy}
        viewMode={viewMode}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
        onCreateNote={() => setIsCreateModalOpen(true)}
      />

      {/* Notes Display */}
      {viewMode === 'list' ? (        
        <NotesListView
          notes={filteredNotes}
          isLoading={isLoading}
          error={error}
          editingNoteId={editingNoteId}
          editedTitle={editedTitle}
          onEditStart={handleEditStart}
          onEditCancel={handleEditCancel}
          onEditChange={handleEditChange}
          onEditSave={handleEditSave}
          onViewNote={handleViewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      ) : (        
        <NotesGridView
          notes={filteredNotes}
          isLoading={isLoading}
          error={error}
          editingNoteId={editingNoteId}
          editedTitle={editedTitle}
          onEditStart={handleEditStart}
          onEditCancel={handleEditCancel}
          onEditChange={handleEditChange}
          onEditSave={handleEditSave}
          onViewNote={handleViewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      )}      
      
      {/* Create Note Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <NoteForm
            mode="create"
            onSave={handleCreateNote}
            onCancel={handleCloseCreateModal}
          />
        </DialogContent>
      </Dialog>

      {/* View Note Modal */}
      <Dialog
        open={isViewModalOpen}
        onClose={handleCloseViewModal}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedNoteId && (
            <NoteForm
              mode="view"
              noteId={selectedNoteId}
              onCancel={handleCloseViewModal}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Note Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedNoteId && (
            <NoteForm
              mode="edit"
              noteId={selectedNoteId}
              onSave={handleUpdateNote}
              onCancel={handleCloseEditModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default MyNotes;

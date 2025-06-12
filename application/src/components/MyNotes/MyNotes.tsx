'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Dialog, DialogContent, MenuItem, TextField } from '@mui/material';
import { Note, NotesApiClient } from 'lib/api/notes';
import NoteForm from '../NotesForm/NoteForm';
import NotesGridView from '../NotesGridView/NotesGridView';
import NotesListView from '../NotesListView/NotesListView';
import NotesHeader from '../NotesHeader/NotesHeader';
import PageContainer from '../PageContainer/PageContainer';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';
import Toast from '../Toast/Toast';
import { Pagination, Box } from '@mui/material';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>(
    'success'
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notes, setNotes] = useState<Note[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);

  // Fetch notes from API
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const { notes, total } = await apiClient.getNotes({ page, pageSize, search: searchQuery });
      setNotes(notes);
      setTotalNotes(total);
      setError(null);
    } catch {
      setError('Failed to load notes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [page, pageSize, searchQuery]);

  const totalPages = Math.ceil(totalNotes / pageSize);

  const sortedNotes = React.useMemo(() => {
    if (!notes) return [];
    const notesCopy = [...notes];
    if (sortBy === 'newest') {
      return notesCopy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'oldest') {
      return notesCopy.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sortBy === 'title') {
      return notesCopy.sort((a, b) => a.title.localeCompare(b.title));
    }
    return notesCopy;
  }, [notes, sortBy]);

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
  const handleCreateNote = async (noteData: { title: string; content: string }) => {
    try {
      const newNote = await apiClient.createNote(noteData);
      setNotes([newNote, ...notes]);
      setIsCreateModalOpen(false);
      // Show success toast
      setToastMessage('Note created successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note. Please try again.');
      // Show error toast
      setToastMessage('Failed to create note');
      setToastSeverity('error');
      setToastOpen(true);
    }
  };
  const handleUpdateNote = async (noteData: { title: string; content: string }) => {
    if (!selectedNoteId) return;

    try {
      const updatedNote = await apiClient.updateNote(selectedNoteId, noteData);
      setNotes(notes.map((note) => (note.id === selectedNoteId ? updatedNote : note)));
      setIsEditModalOpen(false);
      setSelectedNoteId(null);
      // Show success toast
      setToastMessage('Note updated successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
      // Show error toast
      setToastMessage('Failed to update note');
      setToastSeverity('error');
      setToastOpen(true);
    }
  };
  const handleDeleteConfirmation = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteConfirmationOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      try {
        await apiClient.deleteNote(noteToDelete);
        setNotes(notes.filter((note) => note.id !== noteToDelete));
        // Show success toast
        setToastMessage('Note deleted successfully');
        setToastSeverity('success');
        setToastOpen(true);
      } catch (err) {
        console.error('Error deleting note:', err);
        setError('Failed to delete note. Please try again.');
        // Show error toast
        setToastMessage('Failed to delete note');
        setToastSeverity('error');
        setToastOpen(true);
      } finally {
        setDeleteConfirmationOpen(false);
        setNoteToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setNoteToDelete(null);
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  // Legacy handler - now redirects to confirmation flow
  const handleDeleteNote = (noteId: string) => {
    handleDeleteConfirmation(noteId);
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
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedNoteId(null);
    // Don't fetch notes here - only refresh when actual updates are made
  };

  return (
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
          notes={sortedNotes}
          isLoading={isLoading}
          error={error}
          onViewNote={handleViewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      ) : (
        <NotesGridView
          notes={sortedNotes}
          isLoading={isLoading}
          error={error}
          onViewNote={handleViewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      )}

      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={4}>
        <TextField
          select
          label="Rows per page"
          size="small"
          sx={{
            minWidth: 120,
            maxWidth: 120,
            mr: 2,
            '& .MuiFormLabel-root': { color: 'text.medium' },
          }}
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </TextField>
        <Pagination
          count={totalPages || 1}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Create Note Modal */}
      <Dialog open={isCreateModalOpen} onClose={handleCloseCreateModal} maxWidth="md" fullWidth>
        <DialogContent>
          <NoteForm mode="create" onSave={handleCreateNote} onCancel={handleCloseCreateModal} />
        </DialogContent>
      </Dialog>

      {/* View Note Modal */}
      <Dialog open={isViewModalOpen} onClose={handleCloseViewModal} maxWidth="md" fullWidth>
        <DialogContent>
          {selectedNoteId && (
            <NoteForm mode="view" noteId={selectedNoteId} onCancel={handleCloseViewModal} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Note Modal */}
      <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} maxWidth="md" fullWidth>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmButtonColor="error"
      />

      {/* Toast notifications */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={handleCloseToast}
      />
    </PageContainer>
  );
};

export default MyNotes;

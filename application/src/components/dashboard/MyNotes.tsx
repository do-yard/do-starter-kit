'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Stack,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Add, Search, List, GridView, Edit, Save, Close } from '@mui/icons-material';
import { Note, NotesApiClient } from 'lib/api/notes';
import NoteForm from '../notes/NoteForm';

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
  const [editedTitle, setEditedTitle] = useState(''); const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Fetch notes from API
  useEffect(() => {
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
      setEditingNoteId(null); setEditedTitle('');
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
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleViewNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsViewModalOpen(true);
  };

  const handleEditNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsEditModalOpen(true);
  }; const fetchNotes = async () => {
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

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedNoteId(null);
    // Refresh notes list in case note was deleted
    fetchNotes();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedNoteId(null);
  };

  const handleUpdateNote = async (noteData: { id?: string; title: string; content: string }) => {
    try {
      if (noteData.id) {
        const updatedNote = await apiClient.updateNote(noteData.id, {
          title: noteData.title,
          content: noteData.content,
        });
        setNotes(notes.map(note => note.id === noteData.id ? updatedNote : note));
        setIsEditModalOpen(false);
        setSelectedNoteId(null);
      }
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
    }
  };
  const renderGridView = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (filteredNotes.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>No notes found. Create your first note!</Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {filteredNotes.map((note) => (
          <Card key={note.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  {editingNoteId === note.id ? (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                      <TextField
                        value={editedTitle}
                        onChange={handleEditChange}
                        variant="standard"
                        autoFocus
                        fullWidth
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handleEditCancel();
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleEditSave(note.id)}
                      >
                        <Save fontSize="small" />
                      </IconButton>
                    </Stack>
                  ) : (
                    <>
                      <Typography variant="h6" component="h3">
                        {note.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleEditStart(note.id, note.title)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {note.content}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(note.createdAt).toLocaleDateString()}
                </Typography>
              </Stack>
            </CardContent>            <CardActions>
              <Button
                size="small"
                onClick={() => handleViewNote(note.id)}
              >
                View
              </Button>
              <Button
                size="small"
                onClick={() => handleEditNote(note.id)}
              >
                Edit
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    );
  };
  const renderListView = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (filteredNotes.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>No notes found. Create your first note!</Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNotes.map((note) => (
              <TableRow key={note.id} hover>
                <TableCell>
                  {editingNoteId === note.id ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TextField
                        value={editedTitle}
                        onChange={handleEditChange}
                        variant="standard"
                        autoFocus
                        fullWidth
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handleEditCancel();
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleEditSave(note.id)}
                      >
                        <Save fontSize="small" />
                      </IconButton>
                    </Stack>
                  ) : (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1">
                        {note.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleEditStart(note.id, note.title)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {note.content}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      onClick={() => handleViewNote(note.id)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleEditNote(note.id)}
                    >
                      Edit
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ width: '100%', color: '#fff', maxWidth: '1200px', mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Header with title and new note button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2" fontWeight="bold">
          My Notes
        </Typography>        <Button
          onClick={() => setIsCreateModalOpen(true)}
          startIcon={<Add fontSize="small" />}
          variant="contained"
          color="primary"
        >
          New Note
        </Button>
      </Box>

      {/* Controls: View mode, search, and sort */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setViewMode('list')}
            sx={{
              color: viewMode === 'list' ? '#111827' : '#9ca3af',
              backgroundColor: viewMode === 'list' ? '#fff' : 'transparent',
              border: '1px solid #374151',
              borderRadius: 1,
              padding: 1,
              '&:hover': {
                backgroundColor: viewMode === 'list' ? '#f3f4f6' : 'rgba(55, 65, 81, 0.5)',
              },
            }}
            aria-label="list view"
          >
            <List fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('grid')}
            sx={{
              color: viewMode === 'grid' ? '#111827' : '#9ca3af',
              backgroundColor: viewMode === 'grid' ? '#fff' : 'transparent',
              border: '1px solid #374151',
              borderRadius: 1,
              padding: 1,
              '&:hover': {
                backgroundColor: viewMode === 'grid' ? '#f3f4f6' : 'rgba(55, 65, 81, 0.5)',
              },
            }}
            aria-label="grid view"
          >
            <GridView fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            width: { xs: '100%', sm: 'auto' },
          }}
        >          <TextField
            placeholder="Search notes..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: { xs: '100%', sm: '250px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              displayEmpty
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#111827',
                  },
                },
                MenuListProps: {
                  sx: {
                    '& .MuiMenuItem-root': {
                      color: '#fff',
                    },
                    '& .MuiMenuItem-root.Mui-selected': {
                      backgroundColor: '#1f2937',
                    },
                    '& .MuiMenuItem-root:hover': {
                      backgroundColor: 'rgba(31, 41, 55, 0.5)',
                    },
                  },
                },
              }}
            >
              <MenuItem value="newest">Date (Newest)</MenuItem>
              <MenuItem value="oldest">Date (Oldest)</MenuItem>
              <MenuItem value="title">Title (A-Z)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>      {/* Table view */}
      {viewMode === 'list' ? renderListView() : renderGridView()}

      {/* Create Note Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create New Note
          <IconButton onClick={handleCloseCreateModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>        <DialogContent>
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          View Note
          <IconButton onClick={handleCloseViewModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>        <DialogContent>
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Note
          <IconButton onClick={handleCloseEditModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>        <DialogContent>
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
    </Box>
  );
};

export default MyNotes;

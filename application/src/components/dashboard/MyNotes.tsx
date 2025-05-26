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
  styled,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import Paper from '../common/Paper';
import { Add, Search, List, GridView, Edit, Save } from '@mui/icons-material';
import { Note, NotesApiClient } from 'lib/api/NotesApiClient';

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#d1d5db',
  borderBottom: '1px solid #1f2937',
  padding: theme.spacing(2),
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  color: '#9ca3af',
  borderBottom: '1px solid #1f2937',
  padding: theme.spacing(2),
  fontWeight: 500,
}));

const StyledTableRow = styled(TableRow)(() => ({
  '&:hover': {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  '&:last-child td, &:last-child th': {
    borderBottom: 0,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#111827',
    borderRadius: theme.shape.borderRadius,
    border: '1px solid #374151',
    color: '#e5e7eb',
    '&:hover': {
      borderColor: '#4b5563',
    },
    '&.Mui-focused': {
      borderColor: '#6b7280',
      boxShadow: '0 0 0 2px rgba(107, 114, 128, 0.25)',
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5),
  },
  '& .MuiInputAdornment-root': {
    color: '#6b7280',
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: '#111827',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid #374151',
  color: '#e5e7eb',
  '&:hover': {
    borderColor: '#4b5563',
  },
  '& .MuiSelect-select': {
    padding: theme.spacing(1.5),
  },
  '& .MuiSvgIcon-root': {
    color: '#6b7280',
  },
}));

// Create an instance of the ApiClient
const apiClient = new NotesApiClient();

const MyNotes: React.FC = () => {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setEditingNoteId(null);
      setEditedTitle('');
    }
  };

  interface NoteCardProps {
    children: React.ReactNode;
    sx?: SxProps<Theme>;
    key?: string;
  }

  const NoteCard: React.FC<NoteCardProps> = (props) => (
    <Paper
      fullWidth
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        width: '100%',
        ...(props.sx || {}),
      }}
    >
      {props.children}
    </Paper>
  );

  const NoteCardHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  }));

  const NoteCardContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    paddingTop: 0,
    flexGrow: 1,
  }));

  const NoteCardFooter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    paddingTop: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }));

  const renderGridView = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress color="inherit" />
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
          <NoteCard key={note.id}>
            <NoteCardHeader>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {editingNoteId === note.id ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <TextField
                      value={editedTitle}
                      onChange={handleEditChange}
                      variant="standard"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                      sx={{
                        flexGrow: 1,
                        '& .MuiInputBase-root': {
                          color: '#fff',
                        },
                        '& .MuiInput-underline:before': {
                          borderBottomColor: '#4b5563',
                        },
                        '& .MuiInput-underline:hover:before': {
                          borderBottomColor: '#6b7280',
                        },
                        '& .MuiInput-underline:after': {
                          borderBottomColor: '#9ca3af',
                        },
                      }}
                    />
                    <Button
                      size="small"
                      variant="text"
                      sx={{
                        ml: 1,
                        color: '#10b981',
                        minWidth: 'auto',
                        padding: '4px',
                        backgroundColor: 'transparent',
                        '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                      }}
                      onClick={() => handleEditSave(note.id)}
                    >
                      <Save fontSize="small" />
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff' }}>
                      {note.title}
                    </Typography>
                    <IconButton
                      sx={{ color: '#d1d5db', height: 40, width: 40 }}
                      onClick={() => handleEditStart(note.id, note.title)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            </NoteCardHeader>
            <NoteCardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Image content removed as per requirement */}
                <Typography variant="body2" sx={{ color: '#9ca3af', flexGrow: 1 }}>
                  {note.content}
                </Typography>
              </Box>
            </NoteCardContent>
            <NoteCardFooter>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {new Date(note.createdAt).toLocaleDateString()}
              </Typography>
              <Box>
                <Button
                  component="a"
                  href={`/dashboard/notes/${note.id}`}
                  sx={{
                    mr: 1,
                    color: '#d1d5db',
                    '&:hover': { backgroundColor: 'rgba(209, 213, 219, 0.1)' },
                    textTransform: 'none',
                    borderRadius: 1,
                    padding: '8px 12px',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  View
                </Button>
                <Button
                  component="a"
                  href={`/dashboard/notes/${note.id}/edit`}
                  sx={{
                    color: '#d1d5db',
                    '&:hover': { backgroundColor: 'rgba(209, 213, 219, 0.1)' },
                    textTransform: 'none',
                    borderRadius: 1,
                    padding: '8px 12px',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  Edit
                </Button>
              </Box>
            </NoteCardFooter>
          </NoteCard>
        ))}
      </Box>
    );
  };

  const renderListView = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress color="inherit" />
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
      <TableContainer
        component={(props) => <Paper {...props} fullWidth />}
        sx={{
          maxWidth: '100%',
          width: '100%',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell width="25%">Title</StyledTableHeaderCell>
              <StyledTableHeaderCell width="45%">Content</StyledTableHeaderCell>
              <StyledTableHeaderCell width="15%">Date</StyledTableHeaderCell>
              <StyledTableHeaderCell width="15%">Actions</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNotes.map((note) => (
              <StyledTableRow key={note.id}>
                <StyledTableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {editingNoteId === note.id ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <TextField
                          value={editedTitle}
                          onChange={handleEditChange}
                          variant="standard"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              handleEditCancel();
                            }
                          }}
                          sx={{
                            flexGrow: 1,
                            '& .MuiInputBase-root': {
                              color: '#fff',
                            },
                            '& .MuiInput-underline:before': {
                              borderBottomColor: '#4b5563',
                            },
                            '& .MuiInput-underline:hover:before': {
                              borderBottomColor: '#6b7280',
                            },
                            '& .MuiInput-underline:after': {
                              borderBottomColor: '#9ca3af',
                            },
                          }}
                        />
                        <Button
                          size="small"
                          variant="text"
                          sx={{
                            ml: 1,
                            color: '#d1d5db',
                            minWidth: 'auto',
                            padding: '4px',
                            backgroundColor: 'transparent',
                            '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                          }}
                          onClick={() => handleEditSave(note.id)}
                        >
                          <Save fontSize="small" />
                        </Button>
                      </Box>
                    ) : (
                      <>
                        <Typography variant="body1" sx={{ flexGrow: 1 }}>
                          {note.title}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{ ml: 1, color: '#d1d5db' }}
                          onClick={() => handleEditStart(note.id, note.title)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </StyledTableCell>
                <StyledTableCell>{note.content}</StyledTableCell>
                <StyledTableCell>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Button
                    component="a"
                    href={`/dashboard/notes/${note.id}`}
                    sx={{
                      color: '#d1d5db',
                      '&:hover': { backgroundColor: 'rgba(209, 213, 219, 0.1)' },
                      textTransform: 'none',
                      borderRadius: 1,
                      padding: '8px 12px',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      marginRight: 1,
                    }}
                  >
                    View
                  </Button>
                  <Button
                    component="a"
                    href={`/dashboard/notes/${note.id}/edit`}
                    sx={{
                      color: '#d1d5db',
                      '&:hover': { backgroundColor: 'rgba(209, 213, 219, 0.1)' },
                      textTransform: 'none',
                      borderRadius: 1,
                      padding: '8px 12px',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                    }}
                  >
                    Edit
                  </Button>
                </StyledTableCell>
              </StyledTableRow>
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
        </Typography>
        <Button
          component="a"
          href="/dashboard/notes/new"
          startIcon={<Add fontSize="small" />}
          sx={{
            backgroundColor: '#fff',
            color: '#111827',
            '&:hover': {
              backgroundColor: '#f3f4f6',
            },
            textTransform: 'none',
            borderRadius: 1,
            padding: '8px 16px',
            fontWeight: 500,
            fontSize: '0.875rem',
            height: 40,
          }}
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
        >
          <StyledTextField
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
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <StyledSelect
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
            </StyledSelect>
          </FormControl>
        </Box>
      </Box>

      {/* Table view */}
      {viewMode === 'list' ? renderListView() : renderGridView()}
    </Box>
  );
};

export default MyNotes;

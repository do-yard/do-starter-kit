import React from 'react';
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
  IconButton,
  CircularProgress,
  Stack,
  Paper,
} from '@mui/material';
import { Edit, Save, Visibility, Delete } from '@mui/icons-material';
import { Note } from 'lib/api/notes';

interface NotesListViewProps {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  editingNoteId: string | null;
  editedTitle: string;
  onEditStart: (noteId: string, title: string) => void;
  onEditCancel: () => void;
  onEditChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditSave: (noteId: string) => void;
  onViewNote: (noteId: string) => void;
  onEditNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

const NotesListView: React.FC<NotesListViewProps> = ({
  notes,
  isLoading,
  error,
  editingNoteId,
  editedTitle,
  onEditStart,
  onEditCancel,
  onEditChange,
  onEditSave,
  onViewNote,
  onEditNote,
  onDeleteNote,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (notes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
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
          {notes.map((note) => (
            <TableRow key={note.id} hover>
              <TableCell>
                {editingNoteId === note.id ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TextField
                      value={editedTitle}
                      onChange={onEditChange}
                      variant="standard"
                      autoFocus
                      fullWidth
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          onEditCancel();
                        }
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => onEditSave(note.id)}
                    >
                      <Save />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">
                      {note.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => onEditStart(note.id, note.title)}
                    >
                      <Edit />
                    </IconButton>
                  </Stack>
                )}
              </TableCell>              
              <TableCell>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    maxWidth: '300px', // Set a maximum width for the content
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block' // Ensures the typography behaves as a block element
                  }}
                  title={note.content} // Show full content on hover
                >
                  {note.content}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(note.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onViewNote(note.id)}
                    title="View note"
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEditNote(note.id)}
                    title="Edit note"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDeleteNote(note.id)}
                    title="Delete note"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NotesListView;

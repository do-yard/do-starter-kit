import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, CardActions, CircularProgress } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { NotesApiClient } from 'lib/api/notes';

const apiClient = new NotesApiClient();

interface NoteFormProps {
  mode: 'create' | 'edit' | 'view';
  noteId?: string;
  onSave?: (note: { id?: string; title: string; content: string }) => void;
  onCancel?: () => void;
}

/**
 * Unified NoteForm component
 * This component handles creating, editing, and viewing notes with different UI states
 */
const NoteForm: React.FC<NoteFormProps> = ({ mode, noteId, onSave, onCancel }) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [loading, setLoading] = useState(mode !== 'create');
  const [error, setError] = useState<string | null>(null);

  // Fetch note data for edit/view modes
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && noteId) {
      const fetchNote = async () => {
        try {
          setLoading(true);
          const noteData = await apiClient.getNote(noteId);
          setTitle(noteData.title);
          setContent(noteData.content);
          setCreatedAt(noteData.createdAt);
          setError(null);
        } catch (err) {
          console.error('Error fetching note:', err);
          setError('Failed to load note. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchNote();
    }
  }, [mode, noteId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSave) {
      const noteData = mode === 'edit' && noteId
        ? { id: noteId, title, content }
        : { title, content };
      onSave(noteData);
    }
  };
  const handleDelete = async () => {
    if (noteId) {
      try {
        await apiClient.deleteNote(noteId);
        if (onCancel) {
          // For modal mode, call onCancel to close modal
          onCancel();
        } else {
          // For standalone mode, redirect to notes page
          router.push('/dashboard/my-notes');
        }
      } catch (err) {
        console.error('Error deleting note:', err);
        setError('Failed to delete note. Please try again.');
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show error message
  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="h4" gutterBottom>
          {error}
        </Typography>
        <Button
          onClick={onCancel}
          variant="contained"
        >
          Back to Notes
        </Button>
      </Box>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Create New Note';
      case 'edit': return 'Edit Note';
      case 'view': return title;
      default: return 'Note';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {getTitle()}
      </Typography>

      {mode === 'view' && createdAt && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Created: {new Date(createdAt).toLocaleDateString()}
        </Typography>
      )}

      <Card>
        <CardContent>
          {mode !== 'view' ? (
            <form onSubmit={handleSubmit}>
              <TextField
                id="title"
                label="Title"
                fullWidth
                margin="normal"
                placeholder="Enter note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                InputProps={{ readOnly: isReadOnly }}
              />

              <TextField
                id="content"
                label="Content"
                fullWidth
                margin="normal"
                multiline
                rows={6}
                placeholder="Enter note content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                InputProps={{ readOnly: isReadOnly }}
              />

              <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                <Button onClick={onCancel}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  {mode === 'edit' ? 'Update Note' : 'Save Note'}
                </Button>
              </Box>
            </form>
          ) : (
            <Box>
              <Typography variant="body1" paragraph>
                {content}
              </Typography>
            </Box>
          )}
        </CardContent>        {mode === 'view' && (
          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Button
              onClick={handleDelete}
              startIcon={<Delete fontSize="small" />}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </CardActions>
        )}
      </Card>
    </Box>
  );
};

export default NoteForm;

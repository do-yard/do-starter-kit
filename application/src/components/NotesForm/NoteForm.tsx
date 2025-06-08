import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
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
      const noteData =
        mode === 'edit' && noteId ? { id: noteId, title, content } : { title, content };
      onSave(noteData);
    }
  };
  // Show loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        data-testid="note-loading-state"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error message
  if (error) {
    return (
      <Box textAlign="center" p={3} data-testid="note-error-state">
        <Typography variant="h4" gutterBottom data-testid="note-error-message">
          {error}
        </Typography>
        <Button onClick={onCancel} variant="contained" data-testid="note-error-back-button">
          Back to Notes
        </Button>
      </Box>
    );
  }

  const isReadOnly = mode === 'view';
  return (
    <Box>
      {createdAt && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Created: {new Date(createdAt).toLocaleDateString()}
        </Typography>
      )}{' '}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom data-testid="note-form-title">
            {mode === 'create' ? 'Create New Note' : mode === 'edit' ? 'Edit Note' : 'View Note'}
          </Typography>
          <form
            onSubmit={mode !== 'view' ? handleSubmit : (e) => e.preventDefault()}
            data-testid="note-form"
          >
            {' '}
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
              data-testid="note-title-input"
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
              data-testid="note-content-input"
            />{' '}
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={onCancel} data-testid="note-cancel-button">
                {mode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {mode !== 'view' && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  data-testid="note-save-button"
                >
                  {mode === 'edit' ? 'Save Changes' : 'Save Note'}
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NoteForm;

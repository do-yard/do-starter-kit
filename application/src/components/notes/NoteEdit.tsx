import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, styled, CircularProgress } from '@mui/material';
import { NotesApiClient } from 'lib/api/notes';

const apiClient = new NotesApiClient();

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#030712',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid #1f2937',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
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
  '& .MuiFormLabel-root': {
    color: '#9ca3af',
    '&.Mui-focused': {
      color: '#d1d5db',
    },
  },
  '& .MuiInputAdornment-root': {
    color: '#6b7280',
  },
}));

interface NoteEditProps {
  noteId: string;
  onSave: (note: { id: string; title: string; content: string }) => void;
  onCancel: () => void;
}

/**
 * NoteEdit component
 * This component allows users to edit an existing note.
 * @param param0 - noteId: ID of the note to edit, onSave: callback function to save the edited note, onCancel: callback function to cancel editing
 * @returns NoteEdit component
 */
const NoteEdit: React.FC<NoteEditProps> = ({ noteId, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const noteData = await apiClient.getNote(noteId);
        setTitle(noteData.title);
        setContent(noteData.content);
        setError(null);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Failed to load note. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({ id: noteId, title, content });
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>
          {error}
        </Typography>
        <Button
          onClick={onCancel}
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
          }}
        >
          Back to Notes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 3 }}>
        <Typography variant="h3" fontWeight="bold" sx={{ color: '#fff' }}>
          Edit Note
        </Typography>
      </Box>

      <StyledPaper>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Edit Note Details
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body1"
                  sx={{ mb: 1, color: '#9ca3af', fontWeight: 500, fontSize: '0.875rem' }}
                >
                  Title
                </Typography>
                <StyledTextField
                  id="title"
                  fullWidth
                  variant="outlined"
                  placeholder="Enter note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body1"
                  sx={{ mb: 1, color: '#9ca3af', fontWeight: 500, fontSize: '0.875rem' }}
                >
                  Content
                </Typography>
                <StyledTextField
                  id="content"
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder="Enter note content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                type="submit"
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
                }}
              >
                Update Note
              </Button>

              <Button
                onClick={onCancel}
                sx={{
                  border: '1px solid #374151',
                  color: '#d1d5db',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(55, 65, 81, 0.1)',
                  },
                  textTransform: 'none',
                  borderRadius: 1,
                  padding: '8px 16px',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default NoteEdit;

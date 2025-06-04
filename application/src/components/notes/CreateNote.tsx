import React, { useState } from 'react';
import { Box, Typography, TextField, Button, styled } from '@mui/material';
import Paper from 'components/common/Paper';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      borderColor: theme.palette.primary.dark,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}33`,
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5),
  },
  '& .MuiFormLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiInputAdornment-root': {
    color: theme.palette.text.disabled,
  },
}));

interface CreateNoteProps {
  onSave: (note: { title: string; content: string }) => void;
  onCancel: () => void;
}

/**
 * CreateNote component
 * This component provides a form to create a new note with title and content fields.
 */
const CreateNote: React.FC<CreateNoteProps> = ({ onSave, onCancel }) => {
  // State for form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Call the onSave callback with the note data
    onSave({ title, content });
  };

  // No file input handling needed

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 3 }}>
        <Typography variant="h3" fontWeight="bold" sx={{ color: 'text.primary' }}>
          Create New Note
        </Typography>
      </Box>

      <Paper sx={{ backgroundColor: 'background.paper' }}>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              mb: 2,
              color: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[800]
                  : theme.palette.text.primary,
            }}
          >
            Note Details
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: (theme) =>
                      theme.palette.mode === 'light' ? theme.palette.grey[700] : '#9ca3af',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
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
                  sx={{
                    mb: 1,
                    color: (theme) =>
                      theme.palette.mode === 'light' ? theme.palette.grey[700] : '#9ca3af',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
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
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? theme.palette.primary.main : '#fff',
                  color: (theme) =>
                    theme.palette.mode === 'light' ? theme.palette.primary.contrastText : '#111827',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'light' ? theme.palette.primary.dark : '#f3f4f6',
                  },
                  textTransform: 'none',
                  borderRadius: 1,
                  padding: '8px 16px',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                Save Note
              </Button>

              <Button
                onClick={onCancel}
                sx={{
                  border: '1px solid #374151',
                  color: (theme) =>
                    theme.palette.mode === 'light' ? theme.palette.grey[800] : '#d1d5db',
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
      </Paper>
    </Box>
  );
};

export default CreateNote;

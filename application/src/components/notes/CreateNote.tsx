import React, { useState } from 'react';
import { Box, Typography, TextField, Button, styled } from '@mui/material';
import Paper from '../common/Paper';

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

interface CreateNoteProps {
  onSave: (note: { title: string; content: string }) => void;
  onCancel: () => void;
}

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
        <Typography variant="h3" fontWeight="bold" sx={{ color: '#fff' }}>
          Create New Note
        </Typography>
      </Box>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Note Details
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
                Save Note
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
      </Paper>
    </Box>
  );
};

export default CreateNote;

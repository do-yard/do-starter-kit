import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, styled, CircularProgress } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { NotesApiClient } from 'lib/api/notes';

const apiClient = new NotesApiClient();

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[4],
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
}));

const NoteHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const NoteContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingTop: 0,
}));

const NoteFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingTop: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

interface NoteDetailProps {
  noteId: string;
  onBack: () => void;
}

/**
 * NoteDetail component
 * This component fetches and displays the details of a specific note.
 * It includes the note's title, content, creation date, and options to edit or delete the note.
 */
const NoteDetail: React.FC<NoteDetailProps> = ({ noteId, onBack }) => {
  const router = useRouter();
  const [note, setNote] = useState<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const noteData = await apiClient.getNote(noteId);
        setNote(noteData);
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

  const handleDelete = async () => {
    try {
      await apiClient.deleteNote(noteId);
      // Redirect to the my-notes page after successful deletion
      router.push('/dashboard/my-notes');
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error message
  if (error || !note) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>
          {error || 'Note not found'}
        </Typography>
        <Button
          onClick={onBack}
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
      <StyledPaper>
        <NoteHeader>
          <Typography variant="h4" fontWeight="bold">
            {note.title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
            {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date available'}
          </Typography>
        </NoteHeader>

        <NoteContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {note.content}
          </Typography>
        </NoteContent>

        <NoteFooter>
          <Button
            component="a"
            href={`/dashboard/notes/${noteId}/edit`}
            sx={(theme) => ({
              border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : theme.palette.grey[300]}`,
              color: theme.palette.mode === 'dark' ? '#d1d5db' : theme.palette.grey[900],
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(55, 65, 81, 0.1)'
                    : theme.palette.action.hover,
              },
              textTransform: 'none',
              borderRadius: 1,
              padding: '8px 16px',
              fontWeight: 500,
              fontSize: '0.875rem',
            })}
          >
            Edit
          </Button>

          <Button
            onClick={handleDelete}
            startIcon={<Delete fontSize="small" />}
            sx={{
              backgroundColor: '#ef4444',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#dc2626',
              },
              textTransform: 'none',
              borderRadius: 1,
              padding: '8px 16px',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            Delete
          </Button>
        </NoteFooter>
      </StyledPaper>
    </Box>
  );
};

export default NoteDetail;

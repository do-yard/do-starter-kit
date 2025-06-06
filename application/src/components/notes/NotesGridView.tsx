import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Card,
    CardContent,
    CardActions,
    Stack,
} from '@mui/material';
import { Edit, Visibility, Delete } from '@mui/icons-material';
import { Note } from 'lib/api/notes';

interface NotesGridViewProps {
    notes: Note[];
    isLoading: boolean;
    error: string | null;
    onViewNote: (noteId: string) => void;
    onEditNote: (noteId: string) => void;
    onDeleteNote: (noteId: string) => void;
}

const NotesGridView: React.FC<NotesGridViewProps> = ({
    notes,
    isLoading,
    error,
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
            {notes.map((note) => (
                <Card key={note.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                        <Stack spacing={2}>
                            <Typography variant="h6" component="h3">
                                {note.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {note.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(note.createdAt).toLocaleDateString()}
                            </Typography>
                        </Stack>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
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
                    </CardActions>
                </Card>
            ))}
        </Box>
    );
};

export default NotesGridView;

import React, { ChangeEvent } from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Stack,
} from '@mui/material';
import { Add, Search, List, GridView } from '@mui/icons-material';

interface NotesHeaderProps {
  searchQuery: string;
  sortBy: string;
  viewMode: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSortChange: (
    event: ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } }),
    child: React.ReactNode
  ) => void;
  onViewModeChange: (mode: string) => void;
  onCreateNote: () => void;
}

const NotesHeader: React.FC<NotesHeaderProps> = ({
  searchQuery,
  sortBy,
  viewMode,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onCreateNote,
}) => {
  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="right" sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateNote}
        >
          Create Note
        </Button>
      </Stack>

      {/* Search and Filter Controls */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search notes..."
          value={searchQuery}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            value={sortBy}
            onChange={onSortChange}
            displayEmpty
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1}>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            startIcon={<List />}
            onClick={() => onViewModeChange('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            startIcon={<GridView />}
            onClick={() => onViewModeChange('grid')}
          >
            Grid
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default NotesHeader;

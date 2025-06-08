import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyNotes from './MyNotes';

// Mock the API client
jest.mock('lib/api/notes', () => {
  const mockNotes = [
    {
      id: '1',
      userId: 'user1',
      title: 'Test Note 1',
      content: 'Content for test note 1',
      createdAt: '2025-06-01T12:00:00Z'
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Test Note 2',
      content: 'Content for test note 2',
      createdAt: '2025-06-02T12:00:00Z'
    }
  ];
  
  return {
    Note: jest.requireActual('lib/api/notes').Note,
    NotesApiClient: jest.fn().mockImplementation(() => ({
      getNotes: jest.fn().mockResolvedValue(mockNotes),
      createNote: jest.fn().mockImplementation((data) => Promise.resolve({
        id: '3',
        userId: 'user1',
        ...data,
        createdAt: new Date().toISOString()
      })),
      updateNote: jest.fn().mockImplementation((id, data) => Promise.resolve({
        id,
        userId: 'user1',
        ...data,
        createdAt: '2025-06-03T12:00:00Z'
      })),
      deleteNote: jest.fn().mockResolvedValue(undefined)
    }))
  };
});

// Mock child components to simplify testing
jest.mock('../NotesListView/NotesListView', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onViewNote, onEditNote, onDeleteNote }) => (
      <div data-testid="notes-list-view">
        <button onClick={() => onViewNote('1')} data-testid="view-btn">View</button>
        <button onClick={() => onEditNote('1')} data-testid="edit-btn">Edit</button>
        <button onClick={() => onDeleteNote('1')} data-testid="delete-btn">Delete</button>
      </div>
    ))
  };
});

jest.mock('../Toast/Toast', () => {
  return {
    __esModule: true,
    default: jest.fn(({ open, message, severity, onClose }) => (
      open ? (
        <div data-testid={`toast-${severity}`}>
          {message}
          <button onClick={onClose} data-testid="close-toast">Close</button>
        </div>
      ) : null
    ))
  };
});

jest.mock('../NotesGridView/NotesGridView', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="notes-grid-view" />)
  };
});

jest.mock('../NotesHeader/NotesHeader', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onCreateNote, onViewModeChange }) => (
      <div data-testid="notes-header">
        <button onClick={() => onCreateNote()} data-testid="create-btn">Create</button>
        <button onClick={() => onViewModeChange('grid')} data-testid="grid-btn">Grid</button>
        <button onClick={() => onViewModeChange('list')} data-testid="list-btn">List</button>
      </div>
    ))
  };
});

jest.mock('../NotesForm/NoteForm', () => {
  return {
    __esModule: true,
    default: jest.fn(({ mode, onSave, onCancel }) => (
      <div data-testid={`note-form-${mode}`}>
        <button onClick={() => onSave && onSave({ title: 'New Note', content: 'New Content' })} data-testid="save-btn">
          Save
        </button>
        <button onClick={() => onCancel()} data-testid="cancel-btn">Cancel</button>
      </div>
    ))
  };
});

describe('MyNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notes header and list view by default', async () => {
    render(<MyNotes />);
    
    // Header should always be visible
    expect(screen.getByTestId('notes-header')).toBeInTheDocument();
    
    // List view should be the default
    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });
  });

  it('switches between list and grid views', async () => {
    render(<MyNotes />);
    
    // Start with list view
    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });
    
    // Switch to grid view
    fireEvent.click(screen.getByTestId('grid-btn'));
    expect(screen.getByTestId('notes-grid-view')).toBeInTheDocument();
    expect(screen.queryByTestId('notes-list-view')).not.toBeInTheDocument();
    
    // Switch back to list view
    fireEvent.click(screen.getByTestId('list-btn'));
    expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    expect(screen.queryByTestId('notes-grid-view')).not.toBeInTheDocument();
  });

  it('opens create note modal', async () => {
    render(<MyNotes />);
    
    // Open create modal
    fireEvent.click(screen.getByTestId('create-btn'));
    
    expect(screen.getByTestId('note-form-create')).toBeInTheDocument();
  });

  it('opens view note modal', async () => {
    render(<MyNotes />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });
    
    // Click view button
    fireEvent.click(screen.getByTestId('view-btn'));
    
    // View modal should be open
    expect(screen.getByTestId('note-form-view')).toBeInTheDocument();
  });

  it('opens edit note modal', async () => {
    render(<MyNotes />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });
    
    // Click edit button
    fireEvent.click(screen.getByTestId('edit-btn'));
    
    // Edit modal should be open
    expect(screen.getByTestId('note-form-edit')).toBeInTheDocument();
  });

  it('shows delete confirmation dialog', async () => {
    render(<MyNotes />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });
    
    // Click delete button
    fireEvent.click(screen.getByTestId('delete-btn'));
    
    // Confirmation dialog should be open
    expect(screen.getByText('Delete Note')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this note? This action cannot be undone.')).toBeInTheDocument();
  });

  it('creates a new note', async () => {
    render(<MyNotes />);
    
    // Open create modal
    fireEvent.click(screen.getByTestId('create-btn'));
    
    // Save the new note
    fireEvent.click(screen.getByTestId('save-btn'));
    
    // Modal should close after saving
    await waitFor(() => {
      expect(screen.queryByTestId('note-form-create')).not.toBeInTheDocument();
    });
  });

  it('edits an existing note', async () => {
    render(<MyNotes />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });
    
    // Click edit button
    fireEvent.click(screen.getByTestId('edit-btn'));
    
    // Save the edited note
    fireEvent.click(screen.getByTestId('save-btn'));
    
    // Modal should close after saving
    await waitFor(() => {
      expect(screen.queryByTestId('note-form-edit')).not.toBeInTheDocument();
    });
  });

  it('shows success toast when creating a note', async () => {
    render(<MyNotes />);
    
    // Open create modal
    fireEvent.click(screen.getByTestId('create-btn'));
    
    // Save the new note
    fireEvent.click(screen.getByTestId('save-btn'));
    
    // Success toast should appear
    await waitFor(() => {
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByText('Note created successfully')).toBeInTheDocument();
    });
  });

  it('shows success toast when updating a note', async () => {
    render(<MyNotes />);
    
    // Wait for notes to load then edit
    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('edit-btn'));
    
    // Save the edited note
    fireEvent.click(screen.getByTestId('save-btn'));
    
    // Success toast should appear
    await waitFor(() => {
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByText('Note updated successfully')).toBeInTheDocument();
    });
  });
  it('shows success toast when deleting a note', async () => {
    render(<MyNotes />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });
    
    // Click delete button to open confirmation
    fireEvent.click(screen.getByTestId('delete-btn'));
    
    // Confirm deletion using the specific confirm dialog test ID
    fireEvent.click(screen.getByTestId('confirm-dialog-action'));
    
    // Success toast should appear
    await waitFor(() => {
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
      expect(screen.getByText('Note deleted successfully')).toBeInTheDocument();
    });
  });

  it('closes toast notification when close button is clicked', async () => {
    render(<MyNotes />);
    
    // Create a note to trigger toast
    fireEvent.click(screen.getByTestId('create-btn'));
    fireEvent.click(screen.getByTestId('save-btn'));
    
    // Wait for toast to appear
    await waitFor(() => {
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    });
    
    // Close the toast
    fireEvent.click(screen.getByTestId('close-toast'));
    
    // Toast should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('toast-success')).not.toBeInTheDocument();
    });
  });
});

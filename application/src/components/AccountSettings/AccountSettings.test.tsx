import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccountSettings from './AccountSettings';
import { useSession } from 'next-auth/react';

// Mocks
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

global.URL.createObjectURL = jest.fn(() => 'blob:preview-url');
global.URL.revokeObjectURL = jest.fn();

jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
  }),
}));

describe('AccountSettings', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    image: '/profile.jpg',
  };

  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: { user: mockUser },
      status: 'authenticated',
      update: mockUpdate,
    });
  });

  it('renders name and email inputs with initial values', () => {
    render(<AccountSettings />);
    expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
  });

  it('disables the email input', () => {
    render(<AccountSettings />);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeDisabled();
  });

  it('allows changing the name', async () => {
    render(<AccountSettings />);
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Alice');
    expect(nameInput).toHaveValue('Alice');
  });

  it('shows the dropzone if no image is selected', () => {
    render(<AccountSettings />);
    expect(screen.getByText(/drag.*drop a profile image/i)).toBeInTheDocument();
  });

  it('displays an error message if the upload fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({ error: 'Upload failed' })),
      })
    ) as jest.Mock;

    render(<AccountSettings />);
    const button = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(button);

    expect(await screen.findByText(/upload failed/i)).toBeInTheDocument();
  });

  it('calls session.update and shows success indicator on success', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ name: 'Updated', image: '/new-image.png' }),
      })
    ) as jest.Mock;

    render(<AccountSettings />);
    const button = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        user: { name: 'Updated', image: '/new-image.png' },
      });
    });

    expect(screen.getByTestId('DoneIcon')).toBeInTheDocument();
  });
});

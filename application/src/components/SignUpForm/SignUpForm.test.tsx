import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from './SignUpForm';
import React from 'react';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('hooks/navigation', () => ({
  usePrefetchRouter: () => ({ navigate: jest.fn() }),
  useNavigating: () => ({ setNavigating: jest.fn() }),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all inputs', () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(<SignUpForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), '123456');
    await userEvent.type(screen.getByLabelText(/confirm password/i), '654321');

    fireEvent.submit(screen.getByTestId('signup-form'));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits and calls the signup API with correct data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as jest.Mock;

    render(<SignUpForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'securepass');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'securepass');

    fireEvent.submit(screen.getByTestId('signup-form'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'user@example.com', password: 'securepass', name: 'USER' }),
        })
      );
    });
  });

  it('shows error message if signup fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'User already exists' }),
    }) as unknown as jest.Mock;

    render(<SignUpForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'exists@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'abc12345');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'abc12345');

    fireEvent.submit(screen.getByTestId('signup-form'));

    expect(await screen.findByText(/user already exists/i)).toBeInTheDocument();
  });
});

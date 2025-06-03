import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';
import { signIn } from 'next-auth/react';
import React from 'react';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('hooks/navigation', () => ({
  usePrefetchRouter: () => ({ navigate: jest.fn() }),
  useNavigating: () => ({ setNavigating: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('submits form and calls signIn with correct credentials', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValue({ ok: true });

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    const form = screen.getByTestId('login-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error message on failed login', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials', code: '401' });

    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'fail@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');

    fireEvent.submit(screen.getByTestId('login-form'));

    expect(await screen.findByText(/401/i)).toBeInTheDocument();
  });
});

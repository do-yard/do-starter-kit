import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpForm from './SignUpForm';
import { signIn } from 'next-auth/react';
import React from 'react';
import { UserAlreadyExistsError } from 'lib/auth/errors';

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

jest.mock('../../lib/api/stripe', () => ({
  StripeClient: jest.fn().mockImplementation(() => ({
    createSubscription: jest.fn(),
  })),
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
    expect(signIn).not.toHaveBeenCalled();
  });

  it('submits and calls signIn with correct data', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValue({ ok: true });

    render(<SignUpForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'securepass');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'securepass');

    fireEvent.submit(screen.getByTestId('signup-form'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'user@example.com',
        password: 'securepass',
        name: 'USER',
        isSignUp: 'true',
      });
    });
  });

  it('shows error message if signIn fails', async () => {
    const mockSignIn = signIn as jest.Mock;
    const errorInstance = new UserAlreadyExistsError();

    mockSignIn.mockResolvedValue({
      ok: false,
      error: true,
      code: errorInstance.code,
    });

    render(<SignUpForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'exists@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'abc12345');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'abc12345');

    fireEvent.submit(screen.getByTestId('signup-form'));

    expect(await screen.findByText(/user already exists/i)).toBeInTheDocument();
  });
});

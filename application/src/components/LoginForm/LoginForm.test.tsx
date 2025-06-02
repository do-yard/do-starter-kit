import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';
import '@testing-library/jest-dom';
import React from 'react';

// Mock next-auth signIn
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));
import { signIn } from 'next-auth/react';

// Mock navigation hooks
jest.mock('hooks/navigation', () => ({
  useNavigating: () => ({ setNavigating: jest.fn() }),
  usePrefetchRouter: () => ({ navigate: jest.fn() }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form and inputs', () => {
    render(<LoginForm />);

    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in with email/i })).toBeInTheDocument();
  });

  it('updates input values correctly', () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('password123');
  });

  it('shows error on failed login', async () => {
    (signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: 'Invalid credentials',
      code: 'Invalid credentials',
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in with email/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('navigates on successful login', async () => {
    const navigate = jest.fn();
    (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });

    jest.doMock('hooks/navigation', () => ({
      useNavigating: () => ({ setNavigating: jest.fn() }),
      usePrefetchRouter: () => ({ navigate }),
    }));

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'valid@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'securepass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in with email/i }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/');
    });
  });
});

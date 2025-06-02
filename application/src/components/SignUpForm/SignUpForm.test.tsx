import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpForm from './SignUpForm';
import '@testing-library/jest-dom';
import React from 'react';

// Mocks
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));
jest.mock('hooks/navigation', () => ({
  useNavigating: () => ({ setNavigating: jest.fn() }),
  usePrefetchRouter: () => ({ navigate: jest.fn() }),
}));
jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

import { signIn } from 'next-auth/react';

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form fields and button', () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows an error if passwords do not match', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'abcdef' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('shows error when signIn fails', async () => {
    (signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: 'Email already exists',
      code: 'Email already exists',
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'taken@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'securepass' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'securepass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('navigates on successful sign up', async () => {
    const mockNavigate = jest.fn();
    (signIn as jest.Mock).mockResolvedValue({ ok: true });

    // Re-override module to inject our mocked navigate function
    jest.doMock('hooks/navigation', () => ({
      useNavigating: () => ({ setNavigating: jest.fn() }),
      usePrefetchRouter: () => ({ navigate: mockNavigate }),
    }));

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'strongpass' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'strongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});

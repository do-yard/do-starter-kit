import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MagicLinkVerifyPage from './page';

jest.mock('next-auth/react', () => ({ signIn: jest.fn() }));
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({ replace: jest.fn() }),
    useSearchParams: () => new URLSearchParams('token=abc123&email=test%40example.com'),
  };
});

const mockSignIn = require('next-auth/react').signIn;

let originalFetch: typeof globalThis.fetch;
beforeAll(() => {
  if (!globalThis.fetch) {
    globalThis.fetch = jest.fn(() => Promise.resolve({ ok: true, json: async () => ({}) })) as any;
  }
});
afterAll(() => {
  globalThis.fetch = originalFetch;
});

function setup({ token = 'abc123', email = 'test@example.com', signInSuccess = true } = {}) {
  jest.resetAllMocks();
  // Always mock fetch on globalThis
  globalThis.fetch = jest.fn((url) => {
    if (url.toString().includes('/api/auth/magic-link')) {
      return Promise.resolve({ ok: true, json: async () => ({ success: true, user: { id: '1', email, name: 'Test' } }) });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  }) as any;
  mockSignIn.mockImplementation(() => signInSuccess ? Promise.resolve({ ok: true }) : Promise.reject(new Error('Sign in failed')));
  return render(<MagicLinkVerifyPage />);
}

describe('MagicLinkVerifyPage', () => {
  it('shows verifying state initially', () => {
    setup();
    expect(screen.getByText(/verifying magic link/i)).toBeInTheDocument();
  });

  it('signs in and redirects on success', async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/login successful/i)).toBeInTheDocument());
  });

  it('shows error if token or email is missing', async () => {
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ replace: jest.fn() }),
      useSearchParams: () => new URLSearchParams(''),
    }));
    render(<MagicLinkVerifyPage />);
    await waitFor(() => expect(screen.getByText(/missing token or email/i)).toBeInTheDocument());
  });

  it('shows error if signIn fails', async () => {
    setup({ signInSuccess: false });
    await waitFor(() => expect(screen.getByText(/failed to verify magic link/i)).toBeInTheDocument());
  });
});

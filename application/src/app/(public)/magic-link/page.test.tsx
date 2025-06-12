import { render, screen, waitFor } from '@testing-library/react';
import MagicLinkVerifyPage from './page';
import { signIn } from 'next-auth/react';

jest.mock('next-auth/react', () => ({ signIn: jest.fn() }));

const mockSignIn = signIn as jest.Mock;

let originalFetch: jest.Mock;
beforeAll(() => {
  if (!globalThis.fetch) {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({}) })
    ) as unknown as jest.Mock;
  }
});
afterAll(() => {
  globalThis.fetch = originalFetch;
});

function setup({ email = 'test@example.com', signInSuccess = true } = {}) {
  jest.resetAllMocks();
  globalThis.fetch = jest.fn((url: RequestInfo | URL) => {
    if (url.toString().includes('/api/auth/magic-link')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, user: { id: '1', email, name: 'Test' } }),
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  }) as unknown as jest.Mock;
  mockSignIn.mockImplementation(() =>
    signInSuccess ? Promise.resolve({ ok: true }) : Promise.reject(new Error('Sign in failed'))
  );
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

  describe('when token or email is missing', () => {
    // Use correct types for hooks from next/navigation
    let originalUseSearchParams: () => URLSearchParams;
    let originalUseRouter: () => { replace: (url: string) => void };
    beforeAll(() => {
      jest.resetModules();
      originalUseSearchParams = jest.requireActual('next/navigation').useSearchParams;
      originalUseRouter = jest.requireActual('next/navigation').useRouter;
      jest.doMock('next/navigation', () => ({
        useRouter: () => ({ replace: jest.fn() }),
        useSearchParams: () => new URLSearchParams(''),
      }));
    });
    afterAll(() => {
      jest.resetModules();
      jest.doMock('next/navigation', () => ({
        useRouter: originalUseRouter,
        useSearchParams: originalUseSearchParams,
      }));
    });
    it('shows error if token or email is missing', async () => {
      const { default: MagicLinkVerifyPageLocal } = await import('./page');
      render(<MagicLinkVerifyPageLocal />);
      await waitFor(() => expect(screen.getByText(/missing token or email/i)).toBeInTheDocument());
    });
  });

  it('shows error if signIn fails', async () => {
    setup({ signInSuccess: false });
    await waitFor(() =>
      expect(screen.getByText(/failed to verify magic link/i)).toBeInTheDocument()
    );
  });
});

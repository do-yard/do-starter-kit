import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavBar from './NavBar';
import { useSession, signOut } from 'next-auth/react';
import React from 'react';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import useMediaQuery from '@mui/material/useMediaQuery';

describe('NavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders links for unauthenticated users', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop

    render(<NavBar />);

    const pricingLinks = screen.getAllByText('Pricing');
    expect(pricingLinks.length).toBeGreaterThan(0);
    expect(screen.getAllByText('FAQ').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Log in').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sign up').length).toBeGreaterThan(0);
  });

  it('renders links for authenticated users', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Jane' } },
      status: 'authenticated',
    });
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop

    render(<NavBar />);
    const signOutButtons = screen.getAllByText('Sign out');
    expect(signOutButtons.length).toBeGreaterThan(0);
  });

  it('calls signOut on logout click (desktop)', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Jane' } },
      status: 'authenticated',
    });
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop

    render(<NavBar />);

    const signOutButtons = screen.getAllByText('Sign out');
    const appBarButton = signOutButtons.find((el) => el.closest('a')?.getAttribute('href') === '#');

    expect(appBarButton).toBeDefined();
    await userEvent.click(appBarButton!);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('renders drawer toggle on mobile', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    (useMediaQuery as jest.Mock).mockReturnValue(true); // Mobile

    render(<NavBar />);
    expect(screen.getByRole('button')).toBeInTheDocument(); // menu icon
  });
});

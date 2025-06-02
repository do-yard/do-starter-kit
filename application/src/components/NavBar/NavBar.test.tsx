import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from './NavBar';
import { SessionProvider } from 'next-auth/react';
import '@testing-library/jest-dom';

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock useTheme and useMediaQuery
jest.mock('@mui/material/useMediaQuery', () => jest.fn());
import useMediaQuery from '@mui/material/useMediaQuery';

// Mock signOut
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    ...originalModule,
    signOut: jest.fn(),
    useSession: jest.fn(),
  };
});
import { useSession, signOut } from 'next-auth/react';

const renderWithSession = (session: unknown) => {
  return render(
    <SessionProvider session={session}>
      <NavBar />
    </SessionProvider>
  );
};

describe('NavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMediaQuery as jest.Mock).mockImplementation(() => false); // desktop by default
  });

  it('renders logged out nav links on desktop', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });

    renderWithSession(null);

    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('renders logged in nav links on desktop', () => {
    (useSession as jest.Mock).mockReturnValue({ data: { user: { name: 'Jane' } } });

    renderWithSession({ user: { name: 'Jane' } });

    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('calls signOut on "Sign out" click', () => {
    (useSession as jest.Mock).mockReturnValue({ data: { user: { name: 'Jane' } } });

    renderWithSession({ user: { name: 'Jane' } });

    fireEvent.click(screen.getByText('Sign out'));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('renders drawer menu on mobile', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    (useMediaQuery as jest.Mock).mockReturnValue(true); // simulate mobile

    renderWithSession(null);

    fireEvent.click(screen.getByRole('button')); // MenuIcon

    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
  });
});

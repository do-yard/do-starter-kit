'use client';

import Link from 'next/link';
import { Box, Typography, AppBar, Toolbar, Button } from '@mui/material';
import { useSession, signOut } from 'next-auth/react';

/**
 * Main navigation bar of the application.
 * Dynamically changes links according to the session state (log in / log out).
 */
const NavBar = () => {
  const { data: session } = useSession();
  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const navLinks = session
    ? [
        { href: '/pricing', label: 'Pricing' },
        { href: '/faq', label: 'FAQ' },
        { href: '#', label: 'Sign out', onClick: handleLogout },
      ]
    : [
        { href: '/pricing', label: 'Pricing' },
        { href: '/faq', label: 'FAQ' },
        { href: '/login', label: 'Log in' },
        { href: '/signup', label: 'Sign up' },
      ];

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Typography variant="h5" color="primary" fontWeight={700} sx={{ cursor: 'pointer' }}>
            DO Starter Kit
          </Typography>
        </Link>

        <Box>
          {navLinks.map(({ href, label, onClick }) => (
            <Button
              key={label}
              component={Link}
              href={href}
              prefetch={true}
              onClick={onClick}
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: 14,
                ml: 2,
                '&:hover': { color: 'text.primary' },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;

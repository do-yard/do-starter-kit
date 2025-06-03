'use client';

import React, { useState } from 'react';
import { Card, CardContent, TextField, Typography, Box, Divider } from '@mui/material';
import Link from 'next/link';
import FormButton from './FormButton';
import { signIn } from 'next-auth/react';
import { useNavigating, usePrefetchRouter } from 'hooks/navigation';
import { USER_ROLES } from 'lib/auth/roles';
import { ThemeProvider, createTheme } from '@mui/material/styles';

/**
 * User registration form.
 * Includes password validation, Auth.js integration and error handling.
 */
const SignUpForm: React.FC = () => {
  const { navigate } = usePrefetchRouter();
  const { setNavigating } = useNavigating();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setNavigating(true);
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      name: USER_ROLES.USER,
      isSignUp: 'true',
    });

    setNavigating(false);
    if (!res || res.error) {
      setError(res?.code || 'Something went wrong');
    } else if (res.ok) {
      navigate('/');
    }
  };

  return (
    <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
      <Box
        display="flex"
        flexGrow={1}
        minHeight="100vh"
        justifyContent="center"
        alignItems="center"
        bgcolor="#f3f4f6"
      >
        <Card variant="outlined" sx={{ width: '100%', maxWidth: 400 }}>
          <Box display="flex" flexDirection="column" gap={1.5} p={3}>
            <Typography fontWeight="bold" variant="h5">
              Sign Up
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create an account to get started
            </Typography>
          </Box>

          <CardContent sx={{ p: 3, pt: 0, pb: 1 }}>
            <form onSubmit={handleSubmit}>
              <Box display="grid" gap={2}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <label htmlFor="email" style={{ fontSize: 14, lineHeight: 1.5 }}>
                    Email
                  </label>
                  <TextField
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                  <label htmlFor="password" style={{ fontSize: 14 }}>
                    Password
                  </label>
                  <TextField
                    id="password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                  <label htmlFor="confirm-password" style={{ fontSize: 14 }}>
                    Confirm Password
                  </label>
                  <TextField
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Box>
              </Box>

              {error && (
                <Typography color="error" fontSize={14} mt={2}>
                  {error}
                </Typography>
              )}

              <Box mt={3}>
                <FormButton>Sign Up</FormButton>
              </Box>
            </form>
            <Divider sx={{ my: 2 }} />
          </CardContent>

          <Box display="flex" justifyContent="center" alignItems="center" p={3} pt={0}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
              <Link
                href="/login"
                style={{ marginLeft: 4, color: 'black', textDecoration: 'none', fontWeight: 500 }}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default SignUpForm;

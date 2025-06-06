'use client';

import React, { useState } from 'react';
import { Card, CardContent, TextField, Typography, Box, Divider } from '@mui/material';
import Link from 'next/link';
import FormButton from 'components/FormButton/FormButton';
import { signIn } from 'next-auth/react';
import { useNavigating, usePrefetchRouter } from 'hooks/navigation';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

/**
 * Login form.
 * Handles authentication by credentials and integrates with intelligent navigation.
 */
const LoginForm: React.FC = () => {
  const { navigate } = usePrefetchRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setNavigating } = useNavigating();

  const handleSubmit = async (e: React.FormEvent) => {
    setNavigating(true);
    e.preventDefault();
    setError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (!res || res.error) {
      setNavigating(false);
      setError(res?.code || 'Something went wrong');
    } else if (res.ok) {
      navigate('/');
    }
  };

  return (
    <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
      <CssBaseline />
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
              Log In
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back! Please log in to your account
            </Typography>
          </Box>

          <CardContent sx={{ p: 3, pt: 0, pb: 1 }}>
            <form onSubmit={handleSubmit} data-testid="login-form">
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
                  <label htmlFor="password" style={{ fontSize: 14, lineHeight: 1.5 }}>
                    Password
                  </label>
                  <TextField
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <FormButton>Log In with Email</FormButton>
              </Box>
            </form>

            <Divider sx={{ my: 2 }} />
          </CardContent>

          <Box display="flex" justifyContent="space-between" alignItems="center" p={3} pt={0}>
            <Link
              href="/forgot-password"
              style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?
              <Link
                href="/signup"
                style={{ marginLeft: 4, color: 'black', textDecoration: 'none', fontWeight: 500 }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default LoginForm;

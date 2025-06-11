'use client';

import React, { useState } from 'react';
import { Card, CardContent, TextField, Typography, Box, Divider } from '@mui/material';
import FormButton from 'components/FormButton/FormButton';
import { useNavigating } from 'hooks/navigation';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

/**
 * Forgot Password form.
 * Handles sending email for passwordless authentication.
 */
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { setNavigating } = useNavigating();

  const handleSubmit = async (e: React.FormEvent) => {
    setNavigating(true);
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong, please try again later.');
      } else {
        setSuccess('Magic link sent! Please check your email inbox.');
      }
    } catch (err) {
      setError('Something went wrong, please try again later later.');
    } finally {
      setNavigating(false);
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
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <Box display="flex" flexDirection="column" gap={1.5} p={3}>
            <Typography fontWeight="bold" variant="h5">
              Passwordless authentication
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Forgot your password? No problem! Enter your email and we will send you a magic link to log in.
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
              </Box>

              {error && (
                <Typography color="error" fontSize={14} mt={2}>
                  {error}
                </Typography>
              )}
              {success && (
                <Typography color="success" fontSize={14} mt={2}>
                  {success}
                </Typography>
              )}

              <Box mt={3}>
                <FormButton>Send magic link</FormButton>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default LoginForm;

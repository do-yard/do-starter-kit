'use client';

import { Box, Typography, Button } from '@mui/material';
import { EmailClient } from 'lib/api/email';
import { useSession } from 'next-auth/react';
import { useState, useTransition } from 'react';

/**
 * DashboardPage component
 * This page is protected and allows users to send a test email.
 * It displays a welcome message with the user's email and a button to send a test email.
 * If the email is sent successfully, it shows a success message; otherwise, it shows an error message.
 */
export default function DashboardPage() {
  const [sending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const userEmail = session.data?.user?.email || 'Guest';

  const handleSendEmail = () => {
    setError(null);
    setSent(false);
    startTransition(async () => {
      try {
        const api = new EmailClient();
        await api.testEmail(userEmail);
        setSent(true);
      } catch (e) {
        setError((e as Error).message || 'Failed to send email');
      }
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Typography variant="h4">Welcome back, {userEmail}!</Typography>
      <Button
        variant="contained"
        sx={{ mt: 4, minWidth: 200 }}
        disabled={sending}
        onClick={handleSendEmail}
      >
        {sending ? 'Sending...' : 'Send Test Email'}
      </Button>
      {sent && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          Email sent!
        </Typography>
      )}
      {error && (
        <Typography color="error.main" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

'use client';

import { Typography, Box } from '@mui/material';

/**
 * DashboardPageClient renders the dashboard UI and allows the user to send a test email to themselves.
 * @param userEmail - The email address of the logged-in user.
 */
export default function DashboardPageClient({ userEmail }: { userEmail: string }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Typography variant="h4">Welcome back, {userEmail}!</Typography>
    </Box>
  );
}

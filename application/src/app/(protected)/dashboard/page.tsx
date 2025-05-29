import { auth } from 'lib/auth/auth';
import { Typography, Box } from '@mui/material';

/**
 * Main dashboard page protected by authentication.
 * Displays a personalized message to the logged in user.
 *
 * @returns Page with centered greeting and session data.
 */
export default async function DashboardPage() {
  const session = await auth();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography variant="h4">Welcome back, {session?.user.email}!</Typography>
    </Box>
  );
}

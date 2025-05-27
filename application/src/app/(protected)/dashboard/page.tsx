import { auth } from 'lib/auth/auth';
import { Typography, Box } from '@mui/material';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography variant="h4">Welcome back, {session?.user.email}!</Typography>
    </Box>
  );
}

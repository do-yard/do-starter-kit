import { auth } from 'lib/auth/auth';
import { Typography, Box } from '@mui/material';
import { USER_ROLES } from 'lib/auth/roles';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography variant="h4">Welcome back, {session?.user?.email || USER_ROLES.USER}!</Typography>
    </Box>
  );
}

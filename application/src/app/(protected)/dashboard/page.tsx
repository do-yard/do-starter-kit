import { auth } from 'lib/auth/auth';
import { Typography, Box } from '@mui/material';

/**
 * Página principal del dashboard protegida por autenticación.
 * Muestra un mensaje personalizado al usuario logueado.
 *
 * @returns Página con saludo centrado y datos de sesión.
 */
export default async function DashboardPage() {
  const session = await auth();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography variant="h4">Welcome back, {session?.user.email}!</Typography>
    </Box>
  );
}

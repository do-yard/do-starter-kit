'use client';

import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Box, CircularProgress } from '@mui/material';
import { USER_ROLES } from '../../../lib/auth/roles';

interface AdminLayout {
  children: ReactNode;
}

/**
 * Layout component for the admin dashboard that restricts access to admin users.
 *
 * @param children - The child components to render within the layout.
 */
const AdminDashboardLayout = ({ children }: AdminLayout) => {
  const { data: session, status } = useSession();
  if (status === 'loading') {
    return (
      <Box
        display="flex"
        flexGrow={1}
        minHeight="100vh"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (
    status === 'unauthenticated' ||
    (status === 'authenticated' && session.user?.role !== USER_ROLES.ADMIN)
  ) {
    redirect('/');
  }

  return <>{children}</>;
};

export default AdminDashboardLayout;

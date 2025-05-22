'use client';

import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Box, CircularProgress } from '@mui/material';

interface AdminLayout {
  children: ReactNode;
}

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

  if (status === 'unauthenticated' || (status === 'authenticated' && session.user?.role !== 'ADMIN')) {
    redirect('/');
  }

  return (
    <>
      {children}
    </>
  )
}

export default AdminDashboardLayout;
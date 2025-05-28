'use client';
import React from 'react';
import { Box } from '@mui/material';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout principal para páginas protegidas del dashboard.
 * Aplica estructura de sidebar + contenido scrollable.
 *
 * @param children - Contenido principal renderizado en el área del dashboard.
 */
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#030712',
        color: '#fff',
      }}
      className="dashboard"
    >
      <DashboardSidebar />
      <Box
        sx={{
          flexGrow: 1,
          padding: '1rem',
          overflowY: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;

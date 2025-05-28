'use client';
import React from 'react';
import { Box } from '@mui/material';
import DashboardSidebar from './DashboardSidebar';
import { ThemeToggle } from '../Theme/Theme';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%'
      }}
      className="dashboard"
    >
      <DashboardSidebar />
      <Box
        sx={{
          flexGrow: 1,
          padding: '1rem',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <ThemeToggle />
        </Box>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;

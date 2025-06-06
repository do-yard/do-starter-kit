'use client';

import { Box } from '@mui/material';
import Sidebar from 'components/Sidebar/Sidebar';
import MaterialThemeProvider, { ThemeToggle } from 'components/Theme/Theme';

/**
 * Dashboard layout wrapper.
 * Injects the Dashboard layout and renders its child content.
 *
 * @param children - Content of the pages inside the dashboard layout.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <MaterialThemeProvider>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <Sidebar />
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
    </MaterialThemeProvider>
  );
}

'use client';

import { Box } from '@mui/material';
import NavBar from 'components/NavBar/NavBar';
import Footer from 'components/Footer/Footer';
import MaterialLightThemeProvider from 'components/Theme/LightTheme';
import { useNavigating } from 'hooks/navigation';
import { useEffect } from 'react';

/**
 * Public layout used by pages such as login, signup or landing pages.
 * Apply general structure with NavBar, main content and Footer.
 *
 * @param children - Content displayed in the central area of the layout.
 */
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const { setNavigating } = useNavigating();

  useEffect(() => {
    setNavigating(false);
  }, [setNavigating]);

  return (
    <MaterialLightThemeProvider>
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <NavBar />
        <Box component="main" flexGrow={1}>
          {children}
        </Box>
        <Footer />
      </Box>
    </MaterialLightThemeProvider>
  );
};

export default PublicLayout;

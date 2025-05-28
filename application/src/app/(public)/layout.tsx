'use client';

import { Box } from '@mui/material';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';

/**
 * Layout público utilizado por páginas como login, signup o landing.
 * Aplica estructura general con NavBar, contenido principal y Footer.
 *
 * @param children - Contenido que se muestra en la zona central del layout.
 */
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <Box display="flex" flexDirection="column" minHeight="100vh">
    <NavBar />
    <Box component="main" flexGrow={1}>
      {children}
    </Box>
    <Footer />
  </Box>
);

export default PublicLayout;

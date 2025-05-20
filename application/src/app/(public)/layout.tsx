'use client';

import { Box } from '@mui/material';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';

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

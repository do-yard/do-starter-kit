import { Box } from '@mui/material';
import Footer from 'components/Footer/Footer';
import NavBar from 'components/NavBar/NavBar';

const protectedLayout = ({ children }: { children: React.ReactNode }) => (
  <Box display="flex" flexDirection="column" minHeight="100vh">
    <NavBar />
    <Box component="main" flexGrow={1}>
      {children}
    </Box>
    <Footer />
  </Box>
);

export default protectedLayout;

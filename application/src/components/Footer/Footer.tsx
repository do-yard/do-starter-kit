import Link from 'next/link';
import { Box, Container, Typography, List, ListItem, ListItemText } from '@mui/material';

const footerSections = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Documentation'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Blog', 'Careers'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Contact Us', 'System Status'],
  },
  {
    title: 'Legal',
    links: ['Terms of Service', 'Privacy Policy', 'Security'],
  },
];

/**
 * Footer de la aplicación.
 * Muestra secciones con enlaces organizados por categorías y copyright.
 */
export default function Footer() {
  return (
    <Box component="footer" bgcolor="#1a202c" color="white" py={8}>
      <Container maxWidth="lg">
        <Box display="flex" flexWrap="wrap" gap={4}>
          {footerSections.map((section) => (
            <Box key={section.title} flex="1 1 200px" minWidth={180} mb={4}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {section.title}
              </Typography>
              <List dense>
                {section.links.map((link) => (
                  <ListItem key={link} disableGutters sx={{ p: 0 }}>
                    <ListItemText>
                      <Typography
                        component={Link}
                        href="#"
                        sx={{
                          color: 'inherit',
                          textDecoration: 'none',
                          '&:hover': { color: '#60a5fa' },
                        }}
                      >
                        {link}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
        </Box>
        <Box mt={8} textAlign="center" fontSize={14}>
          <Typography variant="body2">© 2025 DO Starter Kit. All rights reserved.</Typography>
        </Box>
      </Container>
    </Box>
  );
}

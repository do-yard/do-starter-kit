import Link from 'next/link';
import { Box, Container, Typography, List, ListItem, ListItemText, useTheme } from '@mui/material';

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
 * Footer of the application.
 * Displays sections with links organized by categories and copyright.
 */
export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        py: 8,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box display="flex" flexWrap="wrap" gap={4}>
          {footerSections.map((section) => (
            <Box key={section.title} flex="1 1 200px" minWidth={180} mb={4}>
              <Typography fontWeight={600} sx={{ color: 'text.primary' }} gutterBottom>
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
                          color: 'text.primary',
                          textDecoration: 'none',
                          '&:hover': {
                            color: 'text.secondary',
                            textDecoration: 'underline',
                          },
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
        <Box mt={2} textAlign="center" fontSize={14}>
          <Typography variant="body2">© 2025 DO Starter Kit. All rights reserved.</Typography>
        </Box>
      </Container>
    </Box>
  );
}

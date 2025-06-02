import React from 'react';
import Button from '@mui/material/Button';
import Link from 'next/link';

/**
 * Stylized form button for submit actions.
 *
 * @param children - Button text or content.
 */
const FormButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Button
    type="submit"
    variant="contained"
    fullWidth
    sx={{
      fontWeight: 500,
      boxShadow: 'none',
      '&:hover': { bgcolor: '#185EA5', boxShadow: 'none' },
      textTransform: 'none',
    }}
    component={Link}
    prefetch={true}
  >
    {children}
  </Button>
);

export default FormButton;

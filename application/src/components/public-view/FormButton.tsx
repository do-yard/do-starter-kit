import React from 'react';
import Button from '@mui/material/Button';

const FormButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Button
    type="submit"
    variant="contained"
    fullWidth
    sx={{ textTransform: 'none', fontWeight: 500, '&:hover': { bgcolor: '#185EA5' } }}
  >
    {children}
  </Button>
);

export default FormButton;
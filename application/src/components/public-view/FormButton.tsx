import React from 'react';
import Button from '@mui/material/Button';

/**
 * Botón de formulario estilizado para acciones de submit.
 *
 * @param children - Texto o contenido del botón.
 */
const FormButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Button
    type="submit"
    variant="contained"
    fullWidth
    sx={{ fontWeight: 500, '&:hover': { bgcolor: '#185EA5' } }}
  >
    {children}
  </Button>
);

export default FormButton;

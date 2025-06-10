import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

interface CustomTextFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

/**
 * CustomTextField is a reusable wrapper around Material UI's TextField component.
 * It provides consistent styling and can be extended with additional props as needed.
 */
const CustomTextField: React.FC<CustomTextFieldProps> = ({
  value,
  onChange,
  disabled,
  label = '',
  id = '',
  name = '',
  placeholder = '',
  type = 'text',
  required = false,
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Typography component="label" htmlFor={id} variant="body2" fontWeight={500}>
      {label}
    </Typography>
    <TextField
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      fullWidth
      variant="outlined"
      disabled={disabled}
      type={type}
      required={required}
    />
  </Box>
);

export default CustomTextField;

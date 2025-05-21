'use client';

import React, { useState } from 'react';
import { Box, Typography, TextField, Button, styled } from '@mui/material';
import Paper from '../common/Paper';

const StyledFileInput = styled('div')(({ theme }) => ({
  border: '2px dashed',
  borderColor: theme.palette.grey[700],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.grey[600],
  },
}));

const HiddenInput = styled('input')({
  border: 0,
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  margin: '-1px 0 0 -1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  width: 1,
  whiteSpace: 'nowrap',
});

export default function AccountSettings() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, profileImage: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // Here you would typically make an API call to update the user's profile
  };

  return (
    <Box sx={{ width: '100%', color: '#fff', pt: 4 }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" sx={{ color: '#fff' }}>
          Account Settings
        </Typography>
      </Box>

      <Paper>
        <Box sx={{ p: 3, width: '100%' }}>
          <Typography variant="h4" fontWeight={600} sx={{ mb: 2, color: '#fff' }}>
            Profile Information
          </Typography>
          <Typography variant="body2" color="#9ca3af" sx={{ mb: 3 }}>
            Update your account details
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography
                  component="label"
                  htmlFor="name"
                  variant="body2"
                  fontWeight={500}
                  sx={{ color: '#fff' }}
                >
                  Name
                </Typography>
                <TextField
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    sx: {
                      color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#374151',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4b5563',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6b7280',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: '#9ca3af',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#6b7280',
                      opacity: 1,
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography
                  component="label"
                  htmlFor="email"
                  variant="body2"
                  fontWeight={500}
                  sx={{ color: '#fff' }}
                >
                  Email
                </Typography>
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    sx: {
                      color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#374151',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4b5563',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6b7280',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: '#9ca3af',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#6b7280',
                      opacity: 1,
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" fontWeight={500} sx={{ color: '#fff' }}>
                  Profile Image
                </Typography>
                <StyledFileInput
                  onClick={() => document.getElementById('profileImage')?.click()}
                  sx={{ color: '#fff', borderColor: '#374151' }}
                >
                  <HiddenInput
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Typography variant="body2" color="#9ca3af">
                    Drag &apos;n&apos; drop a profile image here, or click to select one
                  </Typography>
                </StyledFileInput>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#fff',
                  color: '#111827',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                  },
                  textTransform: 'none',
                  borderRadius: 1,
                  padding: '8px 16px',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                Save Changes
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}

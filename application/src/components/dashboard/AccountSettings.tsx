'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, styled, CircularProgress } from '@mui/material';
import Paper from '../common/Paper';
import { useDropzone } from 'react-dropzone';
import { useSession } from 'next-auth/react';
import DoneIcon from '@mui/icons-material/Done';

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

export default function AccountSettings() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: null as File | null,
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const session = useSession();

  useEffect(() => {
    setFormData({
      name: session.data?.user?.name ?? '',
      email: session.data?.user?.email ?? '',
      profileImage: null,
    });
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setUploadError(null);
      setIsLoading(true);

      try {
        const formDataToSubmit = new FormData();

        if (formData.profileImage !== null) {
          formDataToSubmit.append('file', formData.profileImage);
        }

        if (formData.name) {
          formDataToSubmit.append('name', formData.name);
        }

        //for now just update the picture
        const response = await fetch('/api/profile/upload-picture', {
          method: 'POST',
          body: formDataToSubmit,
        });

        if (!response.ok) {
          const errorText = await response.text();
          const errorJson = JSON.parse(errorText);
          throw new Error((errorJson as { error: string }).error || 'Failed to upload image');
        }

        const json = await response.json();

        session.update({ user: { name: json.name, image: json.image } });

        setIsLoading(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        setUploadError((error as Error).message || 'An error occurred while uploading the image.');
        setIsLoading(false);
      }
    },
    [formData, session]
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFormData((prev) => ({ ...prev, profileImage: acceptedFiles[0] }));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

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
                  disabled={isLoading}
                  InputProps={{
                    sx: {
                      color: isLoading ? '#9ca3af' : '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#374151',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4b5563',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6b7280',
                      },
                      '&.Mui-disabled': {
                        color: '#9ca3af',
                        backgroundColor: 'rgba(55,65,81,0.2)',
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
                  disabled={true}
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
                      '& .Mui-disabled': {
                        WebkitTextFillColor: '#fff',
                        color: '#fff',
                        backgroundColor: 'rgba(55,65,81,0.2)',
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
                {/* Show selected file name if present */}
                {formData.profileImage && (
                  <Typography variant="caption" color="#9ca3af" sx={{ mb: 1 }}>
                    Selected file: {formData.profileImage.name}
                  </Typography>
                )}
                <StyledFileInput
                  sx={{
                    color: isLoading ? '#9ca3af' : '#fff',
                    borderColor: isLoading ? '#6b7280' : '#374151',
                    backgroundColor: isLoading ? 'rgba(55,65,81,0.2)' : 'transparent',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div {...getRootProps()}>
                    <input {...getInputProps()} disabled={isLoading} />
                    <Typography variant="body2" color="#9ca3af">
                      Drag &apos;n&apos; drop a profile image here, or click to select one
                    </Typography>
                  </div>
                </StyledFileInput>
                {uploadError && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {uploadError}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box
              sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', mt: 4 }}
            >
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
                  marginRight: 2,
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress style={{ marginRight: 6 }} />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              {showSuccess && (
                <span
                  style={{ color: 'green', marginLeft: 8, display: 'flex', alignItems: 'center' }}
                >
                  <DoneIcon />
                </span>
              )}
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}

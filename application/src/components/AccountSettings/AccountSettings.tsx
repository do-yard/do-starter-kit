'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, styled, CircularProgress } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useSession } from 'next-auth/react';
import DoneIcon from '@mui/icons-material/Done';
import Image from 'next/image';
import UpdatePasswordForm from '../UpdatePasswordForm/UpdatePasswordForm';
import CustomTextField from '../CustomTextField/CustomTextField';
import PageContainer from '../PageContainer/PageContainer';

const StyledFileInput = styled('div')(({ theme }) => ({
  border: '2px dashed',
  borderColor: theme.palette.grey[400],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.grey[600],
  },
}));

/**
 * User account configuration page.
 * Allows to update name and profile picture, with integration to the active session.
 *
 * Manages forms, dropzone for image and upload/success status.
 */
export default function AccountSettings() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: null as File | null,
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const session = useSession();
  const user = session.data?.user;

  useEffect(() => {
    if (isInitialized || !user) return;

    setFormData({
      name: user.name ?? '',
      email: user.email ?? '',
      profileImage: null,
    });
    setIsInitialized(true);
  }, [isInitialized, user]);

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
        const response = await fetch('/api/profile', {
          method: 'PATCH',
          body: formDataToSubmit,
        });

        if (!response.ok) {
          const errorText = await response.text();
          const errorJson = JSON.parse(errorText);
          throw new Error((errorJson as { error: string }).error || 'Failed to upload image');
        }

        const json = await response.json();

        session.update({ user: { name: json.name, image: json.image } });
        setFormData((prev) => ({ ...prev, profileImage: null, name: json.name }));

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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.profileImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(formData.profileImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [formData.profileImage]);

  return (
    <PageContainer title="Account Settings">
      <Box sx={{ p: 3, width: '100%' }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>
          Profile Information
        </Typography>
        <Typography variant="body2" color="#9ca3af" sx={{ mb: 3 }}>
          Update your account details
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gap: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <CustomTextField
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                label="Name"
                id="name"
                name="name"
                placeholder="Your name"
              />
              <CustomTextField
                value={formData.email}
                onChange={handleInputChange}
                disabled={true}
                label="Email"
                id="email"
                name="email"
                type="email"
                placeholder="Your email"
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" fontWeight={500}>
                Profile Image
              </Typography>
              {/* Show selected file name if present */}
              {formData.profileImage && (
                <Typography variant="caption" sx={{ mb: 1 }}>
                  Selected file: {formData.profileImage.name}
                </Typography>
              )}

              {previewUrl ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      position: 'relative',
                      mx: 'auto',
                      mb: 2,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={previewUrl}
                      alt="Selected profile image preview"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                  <Button
                    onClick={() => setFormData((prev) => ({ ...prev, profileImage: null }))}
                    disabled={isLoading}
                  >
                    Change Image
                  </Button>
                </Box>
              ) : (
                <StyledFileInput {...getRootProps()}>
                  <input {...getInputProps()} disabled={isLoading} />
                  <Typography variant="body2">
                    Drag &apos;n&apos; drop a profile image here, or click to select one
                  </Typography>
                </StyledFileInput>
              )}
              {uploadError && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {uploadError}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
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
                  <CircularProgress style={{ marginRight: 6, color: 'white' }} />
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
      <Box sx={{ mt: 4 }}>
        <UpdatePasswordForm />
      </Box>
    </PageContainer>
  );
}

import React, { useState } from 'react';
import { Button, Card, Typography, Box } from '@mui/material';
import CustomTextField from '../CustomTextField/CustomTextField';

/**
 * Form for updating user password.
 *
 * Has three fields, current password, new password and confirm new password.
 */
export const UpdatePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      formData.append('confirmNewPassword', confirmNewPassword);

      const response = await fetch('/api/password', {
        method: 'PATCH',
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update password.');
      }
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError((err as Error).message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card
        variant="outlined"
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 3, mx: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>
          Change Password
        </Typography>
        <Typography variant="body2" color="#9ca3af" sx={{ mb: 3 }}>
          Ensure your account is secure
        </Typography>
        <Box sx={{ display: 'grid', gap: 4 }}>
          <CustomTextField
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            label="Current Password"
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="Current password"
            required={true}
          />
          <CustomTextField
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            label="New Password"
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="New password"
            required={true}
          />
          <CustomTextField
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            label="Confirm New Password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            placeholder="Confirm new password"
            required={true}
          />
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="success.main" sx={{ mt: 1 }}>
            {success}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default UpdatePasswordForm;

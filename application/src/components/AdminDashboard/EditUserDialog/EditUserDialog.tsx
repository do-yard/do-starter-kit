import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  UserWithSubscriptions,
  SubscriptionStatusEnum,
  SubscriptionPlanEnum,
} from '../../../types';

interface EditUserDialogProps {
  open: boolean;
  editForm: Partial<UserWithSubscriptions>;
  isLoadingEdit: boolean;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEditSubscriptionChange: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
  handleEditButton: () => void;
  handleEditClose: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  editForm,
  isLoadingEdit,
  handleEditChange,
  handleEditSubscriptionChange,
  handleEditButton,
  handleEditClose,
}) => (
  <Dialog open={open} onClose={handleEditClose} maxWidth="xs" fullWidth>
    <DialogTitle>Edit User</DialogTitle>
    <IconButton
      aria-label="close"
      onClick={handleEditClose}
      sx={{ position: 'absolute', right: 8, top: 8 }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
    <DialogContent>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography sx={{ minWidth: 80 }}>Name</Typography>
          <TextField
            margin="dense"
            name="name"
            value={editForm.name ?? ''}
            onChange={handleEditChange}
            fullWidth
          />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography sx={{ minWidth: 80 }}>Email</Typography>
          <TextField
            margin="dense"
            name="email"
            value={editForm.email ?? ''}
            onChange={handleEditChange}
            fullWidth
            disabled
          />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography sx={{ minWidth: 80 }}>Plan</Typography>
          <Select
            margin="dense"
            name="plan"
            value={editForm.subscription?.plan ?? ''}
            onChange={handleEditSubscriptionChange}
            fullWidth
            inputProps={{ 'data-testid': 'plan-select' }}
          >
            {Object.values(SubscriptionPlanEnum).map((plan) => (
              <MenuItem key={plan} value={plan}>
                {plan}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography sx={{ minWidth: 80 }}>Status</Typography>
          <Select
            margin="dense"
            name="status"
            value={editForm.subscription?.status ?? ''}
            onChange={handleEditSubscriptionChange}
            fullWidth
          >
            {Object.values(SubscriptionStatusEnum).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button
        disabled={isLoadingEdit}
        onClick={handleEditButton}
        variant="contained"
        startIcon={isLoadingEdit ? <CircularProgress size={20} /> : null}
      >
        Save Changes
      </Button>
    </DialogActions>
  </Dialog>
);

export default EditUserDialog;

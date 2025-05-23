'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Select,
  CircularProgress,
} from '@mui/material';
import { ApiClient } from '../../lib/apiClient';
import { UserWithSubscriptions } from '../../types';
import Toast from '../common/Toast';

const statusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'TRIALING':
      return 'warning';
    case 'CANCELED':
      return 'error';
    default:
      return 'default';
  }
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithSubscriptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchName, setSearchName] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal state
  const [openEdit, setOpenEdit] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithSubscriptions | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserWithSubscriptions>>({});

  // Toast state
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Open modal and set form state
  const handleEditClick = (user: UserWithSubscriptions) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptions: user.subscriptions
    });
    setOpenEdit(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditSubscriptionChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    setEditForm((prev) => {
      const updatedSubs = prev.subscriptions?.length
        ? [{ ...prev.subscriptions[0], [e.target.name]: e.target.value as string }]
        : [];
      return { ...prev, subscriptions: updatedSubs };
    });
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setSelectedUser(null);
    setEditForm({});
  };

  const handleEditButton = async () => {
    if (!selectedUser) return;
    await updateUser(selectedUser.id, { name: editForm.name, subscriptions: editForm.subscriptions });
  };

  const updateUser = async (userId: string, fields: Partial<UserWithSubscriptions>) => {
    if (!userId) return;
    try {
      setIsLoadingEdit(true);
      const api = new ApiClient();
      await api.updateUser(userId, fields);
      // Refresh users
      const data = await api.getUsers();
      setUsers(data.users || []);
      handleEditClose();
      setToast({ open: true, message: 'User updated successfully!', severity: 'success' });
    } catch (err) {
      setToast({ open: true, message: 'Failed to update user', severity: 'error' });
    } finally {
      setIsLoadingEdit(false);
    }
  };

  // Add this function inside your AdminDashboard component
  const handleAdminSwitchChange = async (user: UserWithSubscriptions, checked: boolean) => {
    setSelectedUser(user);
    await updateUser(user.id, { role: checked ? 'ADMIN' : 'USER' });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const api = new ApiClient();
        const data = await api.getUsers();
        setUsers(data.users || []);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesName = searchName
      ? user.name.toLowerCase().includes(searchName.toLowerCase())
      : true;

    const userPlan = user.subscriptions.length ? user.subscriptions[0].plan : '';
    const matchesPlan = filterPlan ? userPlan === filterPlan : true;

    const userStatus = user.subscriptions.length ? user.subscriptions[0].status : '';
    const matchesStatus = filterStatus ? userStatus === filterStatus : true;

    return matchesName && matchesPlan && matchesStatus;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Admin Dashboard
      </Typography>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight="bold">
              User Management
            </Typography>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
            <TextField
              label="Search by name"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ maxWidth: { md: 300 } }}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <TextField
              select
              label="Filter by plan"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ maxWidth: { md: 200 } }}
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="FREE">Free</MenuItem>
              <MenuItem value="PRO">Pro</MenuItem>
            </TextField>
            <TextField
              select
              label="Filter by status"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ maxWidth: { md: 200 } }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="CANCELED">Canceled</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </TextField>
          </Stack>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const plan = user.subscriptions.length ? user.subscriptions[0].plan : 'none';
                    const status = user.subscriptions.length ? user.subscriptions[0].status : 'none';
                    return (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{plan}</TableCell>
                        <TableCell>
                          <Chip
                            label={status}
                            color={statusColor(status)}
                            size="small"
                            sx={{
                              color: '#fff',
                              textTransform: 'capitalize',
                            }}
                          />
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toISOString().slice(0, 10)}</TableCell>
                        <TableCell>
                          {isLoadingEdit && user.id === selectedUser?.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Switch
                              checked={user.role === 'ADMIN'}
                              onChange={(_, checked) => handleAdminSwitchChange(user, checked)}
                            />
                          )}

                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleEditClick(user)}
                            >
                              Edit
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={openEdit} onClose={handleEditClose} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleEditClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >x</IconButton>
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
                value={editForm.subscriptions?.[0]?.plan ?? ''}
                onChange={handleEditSubscriptionChange}
                fullWidth
              >
                <MenuItem value="FREE">FREE</MenuItem>
                <MenuItem value="PRO">PRO</MenuItem>
              </Select>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography sx={{ minWidth: 80 }}>Status</Typography>
              <Select
                margin="dense"
                name="status"
                value={editForm.subscriptions?.[0]?.status ?? ''}
                onChange={handleEditSubscriptionChange}
                fullWidth
              >
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="CANCELED">CANCELED</MenuItem>
              </Select>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={isLoadingEdit} onClick={handleEditButton} variant="contained" startIcon={isLoadingEdit ? <CircularProgress size={20} /> : null}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdatePasswordForm from './UpdatePasswordForm';

describe('UpdatePasswordForm', () => {
  it('renders all fields and the submit button', () => {
    render(<UpdatePasswordForm />);
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm new password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('shows error if new passwords do not match', async () => {
    render(<UpdatePasswordForm />);
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'newpass1' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpass2' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText(/new passwords do not match/i)).toBeInTheDocument();
  });

  it('calls onSubmit with correct values and shows success', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<UpdatePasswordForm/>);
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        currentPassword: 'oldpass',
        newPassword: 'newpass',
        confirmNewPassword: 'newpass',
      })
    );
    expect(await screen.findByText(/password updated successfully/i)).toBeInTheDocument();
  });

  it('shows error if onSubmit throws', async () => {
    render(<UpdatePasswordForm/>);
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });
});

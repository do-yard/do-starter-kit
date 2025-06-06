import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdatePasswordForm from './UpdatePasswordForm';
import { NextResponse } from 'next/server';

describe('UpdatePasswordForm', () => {
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

  it('shows error if any field is missing', async () => {
    render(<UpdatePasswordForm />);
    // Only fill current password
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'oldpass' } });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();
  });

  it('shows error if API returns error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid current password.' }),
    });
    render(<UpdatePasswordForm />);
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText(/invalid current password/i)).toBeInTheDocument();
    (global.fetch as jest.Mock).mockRestore?.();
  });

  it('shows success and clears fields on successful update', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    render(<UpdatePasswordForm />);
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText(/password updated successfully/i)).toBeInTheDocument();
    expect((screen.getByLabelText(/current password/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/^new password$/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/confirm new password/i) as HTMLInputElement).value).toBe('');
    (global.fetch as jest.Mock).mockRestore?.();
  });

  it('disables button and shows loading text while submitting', async () => {
    let fetchResolve: (() => void) | undefined;
    const fetchPromise = new Promise<NextResponse>((resolve) => {
      fetchResolve = () => resolve(new NextResponse(null, { status: 200 }));
    });
    global.fetch = jest.fn(() => fetchPromise);
    render(<UpdatePasswordForm />);
    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled();
    // Finish fetch
    fetchResolve && fetchResolve();
    await waitFor(() => expect(screen.getByRole('button', { name: /update password/i })).not.toBeDisabled());
    (global.fetch as jest.Mock).mockRestore?.();
  });
});

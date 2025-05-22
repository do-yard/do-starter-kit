import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';

// Mock ApiClient
jest.mock('../../lib/apiClient', () => ({
  ApiClient: jest.fn().mockImplementation(() => ({
    getUsers: jest.fn().mockResolvedValue({
      users: [
        {
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
          role: 'USER',
          createdAt: new Date().toISOString(),
          subscriptions: [{ plan: 'FREE', status: 'ACTIVE' }]
        },
        {
          id: '2',
          name: 'Bob',
          email: 'bob@example.com',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          subscriptions: [{ plan: 'PRO', status: 'CANCELED' }]
        }
      ]
    }),
    updateUser: jest.fn().mockResolvedValue({}),
  })),
}));

describe('AdminDashboard', () => {
  it('renders dashboard title', async () => {
    render(<AdminDashboard />);
    expect(await screen.findByText(/Admin Dashboard/i)).toBeInTheDocument();
  });

  it('renders users in the table', async () => {
    render(<AdminDashboard />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Bob')).toBeInTheDocument();
  });

  it('filters users by name', async () => {
    render(<AdminDashboard />);
    const searchInput = await screen.findByLabelText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('opens edit modal when clicking Edit', async () => {
    render(<AdminDashboard />);
    const editButton = await screen.findAllByText('Edit');
    fireEvent.click(editButton[0]);
    expect(await screen.findByText(/Edit User/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
  });

  it('shows loading indicator while fetching', async () => {
    render(<AdminDashboard />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  });
});
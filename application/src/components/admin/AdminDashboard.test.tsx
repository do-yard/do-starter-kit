import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';

// Update mock to support total and pageSize
jest.mock('../../lib/apiClient', () => {
  let lastArgs: any = {};
  return {
    ApiClient: jest.fn().mockImplementation(() => ({
      getUsers: jest.fn().mockImplementation((args) => {
        lastArgs = args || {};
        const allUsers = [
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
          },
          {
            id: '3',
            name: 'Charlie',
            email: 'charlie@example.com',
            role: 'USER',
            createdAt: new Date().toISOString(),
            subscriptions: [{ plan: 'FREE', status: 'ACTIVE' }]
          }
        ];
        // Simulate pagination
        const page = args?.page || 1;
        const pageSize = args?.pageSize || 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return Promise.resolve({
          users: allUsers.slice(start, end),
          total: allUsers.length
        });
      }),
      updateUser: jest.fn().mockResolvedValue({}),
    })),
  };
});

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

  it('renders pagination controls', async () => {
    render(<AdminDashboard />);
    expect(await screen.findByRole('navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
  });

  it('changes page when pagination is used', async () => {
    render(<AdminDashboard />);
    // Wait for users to load
    await screen.findByText('Alice');
    // Go to page 2
    const nextPageBtn = screen.getByLabelText('Go to page 2');
    fireEvent.click(nextPageBtn);
    // Should still render a user (since mock returns 3 users, pageSize default 10, so all on page 1)
    // Let's set pageSize to 1 to test real pagination
    const rowsSelect = screen.getByLabelText('Rows per page');
    fireEvent.change(rowsSelect, { target: { value: '1' } });
    // Now, go to page 2
    const page2Btn = await screen.findByLabelText('Go to page 2');
    fireEvent.click(page2Btn);
    // Bob should be on page 2
    expect(await screen.findByText('Bob')).toBeInTheDocument();
    // Alice should not be on page 2
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('changes page size', async () => {
    render(<AdminDashboard />);
    await screen.findByText('Alice');
    const rowsSelect = screen.getByLabelText('Rows per page');
    fireEvent.change(rowsSelect, { target: { value: '2' } });
    // Should show Alice and Bob
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Bob')).toBeInTheDocument();
    // Charlie should not be visible on first page
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });
});
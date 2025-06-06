import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { USER_ROLES } from 'lib/auth/roles';

// Mock next-auth/react to avoid ESM import issues in tests
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: '1', name: 'Alice' } },
    status: 'authenticated',
    update: jest.fn(),
  }),
}));

// Update mock to support total and pageSize
jest.mock('../../lib/api/users', () => {
  return {
    UsersClient: jest.fn().mockImplementation(() => ({
      getUsers: jest.fn().mockImplementation((args: Record<string, unknown>) => {
        const allUsers = [
          {
            id: '1',
            name: 'Alice',
            email: 'alice@example.com',
            role: USER_ROLES.USER,
            createdAt: new Date().toISOString(),
            subscriptions: [{ plan: 'FREE', status: 'ACTIVE' }],
          },
          {
            id: '2',
            name: 'Bob',
            email: 'bob@example.com',
            role: USER_ROLES.ADMIN,
            createdAt: new Date().toISOString(),
            subscriptions: [{ plan: 'PRO', status: 'CANCELED' }],
          },
          {
            id: '3',
            name: 'Charlie',
            email: 'charlie@example.com',
            role: USER_ROLES.USER,
            createdAt: new Date().toISOString(),
            subscriptions: [{ plan: 'FREE', status: 'ACTIVE' }],
          },
        ];
        // Simulate pagination
        const page = (args?.page as number) || 1;
        const pageSize = (args?.pageSize as number) || 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return Promise.resolve({
          users: allUsers.slice(start, end),
          total: allUsers.length,
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
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccountSettings from './AccountSettings';
import { SessionProvider } from 'next-auth/react';
import '@testing-library/jest-dom';
import React from 'react';

// eslint-disable-next-line @next/next/no-img-element
const MockNextImage = (props: Record<string, unknown>) => <img {...props} alt="mocked" />;
MockNextImage.displayName = 'MockNextImage';
jest.mock('next/image', () => MockNextImage);

// Mock `fetch` globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ name: 'Updated Name', image: 'new-img.jpg' }),
  })
) as jest.Mock;

// Mock session update
const mockSessionUpdate = jest.fn();

const mockSession = {
  data: {
    user: { name: 'John Doe', email: 'john@example.com', image: 'profile.jpg' },
  },
  status: 'authenticated',
  update: mockSessionUpdate,
};

import type { Session } from 'next-auth';

const renderWithSession = () =>
  render(
    <SessionProvider session={mockSession as unknown as Session}>
      <AccountSettings />
    </SessionProvider>
  );

describe('AccountSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user info and form', async () => {
    renderWithSession();

    await waitFor(() => {
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
  });

  it('updates name input', async () => {
    renderWithSession();

    const nameInput = await screen.findByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

    expect(nameInput).toHaveValue('Jane Smith');
  });

  it('shows preview when image is dropped', async () => {
    renderWithSession();

    const file = new File(['dummy'], 'avatar.png', { type: 'image/png' });
    const input = screen.getByLabelText(/drag.*drop.*profile/i).querySelector('input')!;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(screen.getByText(/selected file/i)).toHaveTextContent('avatar.png'));
  });

  it('submits form and shows success', async () => {
    renderWithSession();

    const saveButton = await screen.findByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(mockSessionUpdate).toHaveBeenCalled());

    expect(await screen.findByText(/saving.../i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText((_, el) => el?.textContent === 'Save Changes')).toBeInTheDocument()
    );
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthButton from '../src/app/components/AuthButton';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the Supabase client
const mockSignOut = jest.fn().mockResolvedValue({ error: null });
const mockGetUser = jest.fn();
jest.mock('../src/lib/supabase/client', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
  }),
}));

describe('AuthButton', () => {
  it('renders login and signup buttons when no user is logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<AuthButton />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  it('renders account, brand heart, and logout buttons when a user is logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'test@example.com' } } });
    render(<AuthButton />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /account/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /brand heart/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });

  it('calls signOut when the logout button is clicked', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'test@example.com' } } });
    render(<AuthButton />);

    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});

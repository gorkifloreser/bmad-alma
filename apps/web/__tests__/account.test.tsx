import { render, screen, fireEvent } from '@testing-library/react';
import AccountPage from '../app/account/page';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the Supabase client
const mockRpc = jest.fn().mockResolvedValue({ error: null });
const mockGetUser = jest.fn().mockResolvedValue({ data: { user: { email: 'test@example.com' } } });
jest.mock('../src/lib/supabase/client', () => ({
  createSupabaseBrowserClient: () => ({
    rpc: mockRpc,
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

describe('AccountPage', () => {
  it('renders the form and allows saving language preferences', async () => {
    render(<AccountPage />);

    // Find form elements
    const primaryLanguageSelect = screen.getByLabelText('Primary Language');
    const secondaryLanguageSelect = screen.getByLabelText('Secondary Language (Optional)');
    const saveButton = screen.getByRole('button', { name: /save settings/i });

    // Assert initial state
    expect(primaryLanguageSelect).toBeInTheDocument();
    expect(secondaryLanguageSelect).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
    
    // Wait for the user to be loaded and the logout button to appear
    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();

    // Simulate user interaction
    fireEvent.mouseDown(primaryLanguageSelect);
    fireEvent.click(screen.getByText('Spanish'));
    fireEvent.mouseDown(secondaryLanguageSelect);
    const frenchOptions = screen.getAllByText('French');
    fireEvent.click(frenchOptions[1]); // Click the second "French" option
    fireEvent.click(saveButton);

    // Assert that the Supabase rpc client was called with the correct data
    expect(mockRpc).toHaveBeenCalledWith('update_user_languages', {
      p_primary_language: 'es',
      p_secondary_language: 'fr',
    });
  });
});
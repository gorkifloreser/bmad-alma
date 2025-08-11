import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BrandHeartPage from '../app/brand-heart/page';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the Supabase client
const mockUpsert = jest.fn().mockResolvedValue({ error: null });
const mockUpload = jest.fn().mockResolvedValue({ error: null });
const mockFrom = jest.fn(() => ({
  upsert: mockUpsert,
  upload: mockUpload,
}));
jest.mock('../src/lib/supabase/client', () => ({
  createSupabaseBrowserClient: () => ({
    from: mockFrom,
    storage: {
      from: mockFrom,
    },
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
    },
  }),
}));

describe('BrandHeartPage', () => {
  it('renders the form and allows saving the brand heart', async () => {
    render(<BrandHeartPage />);

    // Find form elements
    const missionInput = screen.getByLabelText(/mission/i);
    const visionInput = screen.getByLabelText(/vision/i);
    const valuesInput = screen.getByLabelText(/values/i);
    const toneInput = screen.getByLabelText(/tone of voice/i);
    const saveButton = screen.getByRole('button', { name: /save/i });

    // Assert that form elements are present
    expect(missionInput).toBeInTheDocument();
    expect(visionInput).toBeInTheDocument();
    expect(valuesInput).toBeInTheDocument();
    expect(toneInput).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();

    // Simulate user input
    fireEvent.change(missionInput, { target: { value: 'Our mission' } });
    fireEvent.change(visionInput, { target: { value: 'Our vision' } });
    fireEvent.change(valuesInput, { target: { value: 'Our values' } });
    fireEvent.change(toneInput, { target: { value: 'Our tone' } });

    // Simulate form submission
    fireEvent.click(saveButton);

    // Assert that the Supabase client was called with the correct data
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('brand_heart');
      expect(mockUpsert).toHaveBeenCalledWith({
        mission: 'Our mission',
        vision: 'Our vision',
        values: 'Our values',
        tone_of_voice: 'Our tone',
      });
    });
  });

  it('allows a user to upload a document', async () => {
    render(<BrandHeartPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/click to upload a file/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('alma');
      expect(mockUpload).toHaveBeenCalledWith(expect.any(String), file);
    });
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BrandHeartPage from '../app/brand-heart/page';

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: (options: { onDrop: (files: File[]) => void }) => ({
    getRootProps: () => ({
      onDrop: (event: { dataTransfer: { files: File[] } }) => options.onDrop(event.dataTransfer.files),
    }),
    getInputProps: () => ({}),
    isDragActive: false,
  }),
}));

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
}));
const mockStorageFrom = jest.fn(() => ({
  upload: mockUpload,
}));
const mockFunctionsInvoke = jest.fn().mockResolvedValue({ error: null });
jest.mock('../src/lib/supabase/client', () => ({
  createSupabaseBrowserClient: () => ({
    from: mockFrom,
    storage: {
      from: mockStorageFrom,
    },
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
    },
    functions: {
      invoke: mockFunctionsInvoke,
    },
  }),
}));

describe('BrandHeartPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the brand heart page', () => {
    render(<BrandHeartPage />);
    expect(screen.getByText(/define your brand heart/i)).toBeInTheDocument();
  });

  it('allows a user to upload and process a document', async () => {
    render(<BrandHeartPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const dropzone = screen.getByText(/drag 'n' drop/i);

    // Simulate a file drop
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        files: [file],
      },
    });
    fireEvent(dropzone, dropEvent);

    // Wait for the "Upload & Process" button to appear and click it
    const uploadButton = await screen.findByRole('button', { name: /upload & process/i });
    fireEvent.click(uploadButton);

    // Assert that the file was uploaded and the function was invoked
    await waitFor(() => {
      expect(mockStorageFrom).toHaveBeenCalledWith(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_ID!);
      expect(mockUpload).toHaveBeenCalledWith('123/hello.png', file, expect.any(Object));
    });

    await waitFor(() => {
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('process-document', {
        body: { file_path: '123/hello.png', user_id: '123' },
      });
    });
  });
});
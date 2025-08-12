import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BrandHeartQuery from '../app/components/BrandHeartQuery';
import { createSupabaseBrowserClient } from '../src/lib/supabase/client';

// Mock the Supabase client
jest.mock('../src/lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn(() => ({
    functions: {
      invoke: jest.fn(),
    },
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('BrandHeartQuery', () => {
  const mockSupabase = {
    functions: {
      invoke: jest.fn(),
    },
  };

  beforeEach(() => {
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the component', () => {
    render(<BrandHeartQuery />);
    expect(screen.getByLabelText(/ask a question about your brand/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ask/i })).toBeInTheDocument();
  });

  it('shows an alert if the question is empty', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<BrandHeartQuery />);
    fireEvent.click(screen.getByRole('button', { name: /ask/i }));
    expect(alertSpy).toHaveBeenCalledWith('Please enter a question.');
    alertSpy.mockRestore();
  });

  it('calls the query-brand-heart function and OpenAI on query', async () => {
    const mockContext = [{ content: 'Brand is about creativity.' }];
    mockSupabase.functions.invoke.mockResolvedValue({ data: mockContext, error: null });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'The brand is about being creative.' } }],
      }),
    });

    render(<BrandHeartQuery />);
    fireEvent.change(screen.getByLabelText(/ask a question about your brand/i), {
      target: { value: 'What is the brand about?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ask/i }));

    expect(screen.getByRole('button', { name: /thinking.../i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('query-brand-heart', {
        body: { query: 'What is the brand about?' },
      });
    });

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText('The brand is about being creative.')).toBeInTheDocument();
    });
  });
});

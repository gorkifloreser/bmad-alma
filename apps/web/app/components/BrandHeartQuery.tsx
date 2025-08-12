'use client';

import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../../src/lib/supabase/client';

export default function BrandHeartQuery() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async () => {
    if (!question.trim()) {
      alert('Please enter a question.');
      return;
    }

    setIsLoading(true);
    setAnswer('');

    const supabase = createSupabaseBrowserClient();

    // 1. Get relevant context from our documents
    const { data: context, error: contextError } = await supabase.functions.invoke('query-brand-heart', {
      body: { query: question },
    });

    if (contextError) {
      setIsLoading(false);
      alert(`Error fetching context: ${contextError.message}`);
      return;
    }

    // 2. Call Gemini to generate the final answer
    const prompt = `Context: ${JSON.stringify(context)}\n\nQuestion: ${question}\n\nAnswer:`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    if (!geminiResponse.ok) {
        setIsLoading(false);
        const errorData = await geminiResponse.json();
        alert(`Error from Gemini: ${errorData.error.message}`);
        return;
    }

    const { candidates } = await geminiResponse.json();
    setAnswer(candidates[0].content.parts[0].text);
    setIsLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Query Your Brand Heart
        </Typography>
        <TextField
          fullWidth
          label="Ask a question about your brand"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          margin="normal"
          variant="outlined"
        />
        <Button
          variant="contained"
          onClick={handleQuery}
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? 'Thinking...' : 'Ask'}
        </Button>

        {answer && (
          <Box sx={{ mt: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
            <Typography variant="h6">Answer:</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{answer}</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

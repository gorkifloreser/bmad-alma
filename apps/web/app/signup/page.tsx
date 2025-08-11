'use client';

import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../../src/lib/supabase/client';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const supabase = createSupabaseBrowserClient();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // email_redirect_to is not strictly required for this story,
        // but it's good practice to have it for email confirmation.
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      // Supabase sends a confirmation email. For this story, we will just
      // redirect the user to the login page with a message.
      // In a real app, you would want to show a "please confirm your email" message.
      router.push('/login?message=Check email to continue sign in process');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Create your account
        </Typography>
        <Typography component="p" sx={{ mt: 1, color: 'text.secondary' }}>
          Welcome! Let's begin your journey.
        </Typography>
        <Box component="form" onSubmit={handleSignUp} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

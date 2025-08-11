'use client';

import { Button, Container, Typography } from '@mui/material';

export default function Home() {
  return (
    <Container>
      <Typography variant="h1" component="h1" gutterBottom>
        Welcome to Alma App
      </Typography>
      <Typography variant="body1" gutterBottom>
        This is the beginning of a regenerative marketing ecosystem.
      </Typography>
      <Button variant="contained" color="primary">
        Get Started
      </Button>
    </Container>
  );
}

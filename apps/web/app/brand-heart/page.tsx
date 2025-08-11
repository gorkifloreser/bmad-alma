'use client';

import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../../src/lib/supabase/client';

export default function BrandHeartPage() {
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [values, setValues] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to upload a file.');
      return;
    }

    const filePath = `${user.id}/${file.name}`;
    const { error } = await supabase.storage.from('alma').upload(filePath, file);

    if (error) {
      alert(`Error uploading file: ${error.message}`);
    } else {
      alert('File uploaded successfully!');
    }
  };

  const handleSave = async () => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('brand_heart').upsert({
      mission,
      vision,
      values,
      tone_of_voice: toneOfVoice,
    });

    if (error) {
      alert(`Error saving brand heart: ${error.message}`);
    } else {
      alert('Brand heart saved successfully!');
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Define Your Brand Heart
        </Typography>
        <Box component="form" noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="mission"
            label="Mission"
            name="mission"
            autoFocus
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            multiline
            rows={4}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="vision"
            label="Vision"
            name="vision"
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            multiline
            rows={4}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="values"
            label="Values"
            name="values"
            value={values}
            onChange={(e) => setValues(e.target.value)}
            multiline
            rows={4}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="tone_of_voice"
            label="Tone of Voice"
            name="tone_of_voice"
            value={toneOfVoice}
            onChange={(e) => setToneOfVoice(e.target.value)}
            multiline
            rows={4}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSave}
          >
            Save
          </Button>
          <Typography component="h2" variant="h6" sx={{ mt: 4 }}>
            Or Upload a Document
          </Typography>
          <label htmlFor="file-upload" style={{ marginTop: '1rem', cursor: 'pointer' }}>
            Click to upload a file
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </Box>
      </Box>
    </Container>
  );
}

'use client';

import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../../src/lib/supabase/client';
import BrandHeartQuery from '../components/BrandHeartQuery';
import FileUploader from '../components/FileUploader';

export default function BrandHeartPage() {
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [values, setValues] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('');

  useEffect(() => {
    const fetchBrandHeart = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('brand_heart')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setMission(data.mission || '');
          setVision(data.vision || '');
          setValues(data.values || '');
          setToneOfVoice(data.tone_of_voice || '');
        }
      }
    };

    fetchBrandHeart();
  }, []);

  const handleSave = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to save your brand heart.');
      return;
    }

    const { error } = await supabase.from('brand_heart').upsert({
      user_id: user.id,
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
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Define Your Brand Heart</Typography>
        <Box component="form" noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField margin="normal" required fullWidth id="mission" label="Mission" name="mission" autoFocus value={mission} onChange={(e) => setMission(e.target.value)} multiline rows={4} />
          <TextField margin="normal" required fullWidth id="vision" label="Vision" name="vision" value={vision} onChange={(e) => setVision(e.target.value)} multiline rows={4} />
          <TextField margin="normal" required fullWidth id="values" label="Values" name="values" value={values} onChange={(e) => setValues(e.target.value)} multiline rows={4} />
          <TextField margin="normal" required fullWidth id="tone_of_voice" label="Tone of Voice" name="tone_of_voice" value={toneOfVoice} onChange={(e) => setToneOfVoice(e.target.value)} multiline rows={4} />
          <Button type="button" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleSave}>Save</Button>
        </Box>

        <Box sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
          <Typography component="h2" variant="h6">Or Upload to Your Knowledge Base</Typography>
          <FileUploader />
        </Box>
        <BrandHeartQuery />
      </Box>
    </Container>
  );
}

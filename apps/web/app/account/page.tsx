'use client';

import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../../src/lib/supabase/client';
import AuthButton from '../../src/app/components/AuthButton';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  // Add other languages as needed
];

export default function AccountPage() {
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [secondaryLanguage, setSecondaryLanguage] = useState('');

  const handleSave = async () => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.rpc('update_user_languages', {
      p_primary_language: primaryLanguage,
      p_secondary_language: secondaryLanguage,
    });

    if (error) {
      alert(`Error updating languages: ${error.message}`);
    } else {
      alert('Settings saved successfully!');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Account Settings
        </Typography>
        <AuthButton />
        <Box component="form" noValidate sx={{ mt: 3, width: '100%' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="primary-language-label">Primary Language</InputLabel>
            <Select
              labelId="primary-language-label"
              id="primary-language"
              value={primaryLanguage}
              label="Primary Language"
              onChange={(e) => setPrimaryLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="secondary-language-label">Secondary Language (Optional)</InputLabel>
            <Select
              labelId="secondary-language-label"
              id="secondary-language"
              value={secondaryLanguage}
              label="Secondary Language (Optional)"
              onChange={(e) => setSecondaryLanguage(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

// components/FileUploader.tsx
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../../src/lib/supabase/client';

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setStatusMessage('Uploading and processing file...');

    try {
      const supabase = createSupabaseBrowserClient();
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-and-process', {
        body: formData,
      });

      if (error) {
        setStatus('error');
        setStatusMessage(`❌ Error: ${error.message}`);
        return;
      }

      if (data.error) {
        setStatus('error');
        setStatusMessage(`❌ Error: ${data.error}`);
        return;
      }

      setStatus('success');
      setStatusMessage(`✅ ${data.message}`);

    } catch (error) {
      setStatus('error');
      setStatusMessage(`❌ Network Error: ${(error as Error).message}`);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        disabled={status === 'uploading'}
      />
      <button onClick={handleUpload} disabled={!file || status === 'uploading'}>
        {status === 'uploading' ? 'Uploading...' : 'Upload File'}
      </button>
      <p>{statusMessage}</p>
    </div>
  );
}

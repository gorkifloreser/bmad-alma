// components/FileUploader.tsx
import { useState } from 'react';

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'metadata',
      JSON.stringify({ description: 'Documento para RAG', source: 'usuario' })
    );

    setStatus('uploading');
    setStatusMessage('Uploading file to storage...');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setStatusMessage(`✅ File uploaded: ${data.publicUrl}`);
      } else {
        setStatus('error');
        // Use the error message from the API response, or a default
        setStatusMessage(`❌ Error: ${data.error || 'An unknown error occurred.'}`);
      }
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
        disabled={status === 'uploading' || status === 'processing'}
      />
      <button onClick={handleUpload} disabled={!file || status === 'uploading' || status === 'processing'}>
        {status === 'uploading' ? 'Uploading...' : 'Upload File'}
      </button>
      <p>{statusMessage}</p>
    </div>
  );
}

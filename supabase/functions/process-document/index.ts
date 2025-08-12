import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY"));

serve(async (req) => {
  const { file_path, user_id } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. First, delete any existing embeddings for this file
  await supabase
    .from('brand_documents')
    .delete()
    .eq('user_id', user_id)
    .eq('file_name', file_path);

  // 2. Get the file from Supabase Storage
  const { data: file, error: downloadError } = await supabase.storage
    .from(Deno.env.get('SUPABASE_BUCKET_ID')!)
    .download(file_path);

  if (downloadError) {
    return new Response(JSON.stringify({ error: `Failed to download file: ${downloadError.message}` }), { status: 500 });
  }

  const fileText = await file.text();
  const chunks = fileText.split('\n\n').filter(chunk => chunk.trim() !== '');

  // 3. Generate embeddings using Gemini
  const model = genAI.getGenerativeModel({ model: "embedding-001" });

  for (const chunk of chunks) {
    const result = await model.embedContent(chunk);
    const embedding = result.embedding.values;

    // 4. Store the chunk and embedding
    const { error: insertError } = await supabase
      .from('brand_documents')
      .insert({
        user_id: user_id,
        content: chunk,
        embedding: embedding,
        file_name: file_path,
      });

    if (insertError) {
      console.error('Error inserting embedding:', insertError);
    }
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});

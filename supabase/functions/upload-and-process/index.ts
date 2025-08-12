import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);

// Main function to handle requests
serve(async (req) => {
  // 1. --- Pre-flight check for CORS ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    // 2. --- Authenticate the user ---
    // Create a Supabase client with the user's auth token
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User auth error:', userError?.message);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401 });
    }

    // 3. --- Parse the multipart form data ---
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // 4. --- Upload the file to Supabase Storage ---
    // Use the service role key for backend operations like storage and DB inserts
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const filePath = `documents/${user.id}/${file.name}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(Deno.env.get('SUPABASE_BUCKET_ID')!)
      .upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError.message);
      return new Response(JSON.stringify({ error: `Failed to upload file: ${uploadError.message}` }), { status: 500 });
    }

    // 5. --- Process the file for RAG ---
    console.log(`Processing file: ${filePath} for user: ${user.id}`);

    // First, delete any existing embeddings for this file to handle re-uploads
    await supabaseAdmin
      .from('brand_documents')
      .delete()
      .eq('user_id', user.id)
      .eq('file_name', filePath);

    // Get file content as text
    const fileText = await file.text();
    // A simple chunking strategy, splitting by double newlines
    const chunks = fileText.split('\n\n').filter(chunk => chunk.trim() !== '');
    console.log(`File split into ${chunks.length} chunks.`);

    // Generate embeddings for each chunk
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    let chunksProcessed = 0;
    for (const chunk of chunks) {
      const result = await model.embedContent(chunk);
      const embedding = result.embedding.values;

      // Store the chunk and embedding in the database
      const { error: insertError } = await supabaseAdmin
        .from('brand_documents')
        .insert({
          user_id: user.id,
          content: chunk,
          embedding: embedding,
          file_name: filePath,
        });

      if (insertError) {
        console.error('Error inserting embedding:', insertError.message);
        // Decide if we should stop or continue. For now, we'll log and continue.
      } else {
        chunksProcessed++;
      }
    }
    console.log(`Successfully processed and stored ${chunksProcessed} chunks.`);

    // 6. --- Return success response ---
    return new Response(JSON.stringify({ success: true, message: `File uploaded and processed successfully. ${chunksProcessed} chunks created.` }), { status: 200 });

  } catch (error) {
    console.error('Unhandled error:', error.message);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), { status: 500 });
  }
});

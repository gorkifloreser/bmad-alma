import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY"));

serve(async (req) => {
  const { query } = await req.json();

  // 1. Generate an embedding for the user's question using Gemini
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(query);
  const queryEmbedding = result.embedding.values;

  // 2. Query the database for similar document chunks
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: documents, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.78, // This may need tuning for Gemini embeddings
    match_count: 10,
  });

  if (error) {
    console.error('Error matching documents:', error);
    return new Response(JSON.stringify({ error: 'Failed to match documents' }), { status: 500 });
  }

  // 3. Return the matched documents
  return new Response(JSON.stringify(documents), {
    headers: { 'Content-Type': 'application/json' },
  });
});

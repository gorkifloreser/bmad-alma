CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    brand_documents.id,
    brand_documents.content,
    1 - (brand_documents.embedding <=> query_embedding) as similarity
  FROM brand_documents
  WHERE 1 - (brand_documents.embedding <=> query_embedding) > match_threshold
  AND brand_documents.user_id = auth.uid()
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_storage_object_inserted ON storage.objects;
DROP TRIGGER IF EXISTS on_storage_object_updated ON storage.objects;
DROP TRIGGER IF EXISTS on_storage_object_deleted ON storage.objects;

-- Trigger for new document uploads
CREATE OR REPLACE FUNCTION public.handle_storage_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url:='https://buiprkjrvglmrytovjbp.supabase.co/functions/v1/process-document',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1aXBya2pydmdsbXJ5dG92amJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzMzAwNCwiZXhwIjoyMDcwNTA5MDA0fQ.SKywnjt9HJuZkKfyoWp6bBVRmQIGEEcbylExxOfKtOI"}'::jsonb,
    body:=jsonb_build_object(
      'file_path', NEW.name,
      'user_id', NEW.owner
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_storage_object_inserted
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'alma')
  EXECUTE PROCEDURE public.handle_storage_insert();

-- Trigger for document updates
CREATE OR REPLACE FUNCTION public.handle_storage_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url:='https://buiprkjrvglmrytovjbp.supabase.co/functions/v1/update-document',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1aXBya2pydmdsbXJ5dG92amJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzMzAwNCwiZXhwIjoyMDcwNTA5MDA0fQ.SKywnjt9HJuZkKfyoWp6bBVRmQIGEEcbylExxOfKtOI"}'::jsonb,
    body:=jsonb_build_object(
      'file_path', NEW.name,
      'user_id', NEW.owner
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_storage_object_updated
  AFTER UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'alma')
  EXECUTE PROCEDURE public.handle_storage_update();

-- Trigger for document deletions
CREATE OR REPLACE FUNCTION public.handle_storage_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url:='https://buiprkjrvglmrytovjbp.supabase.co/functions/v1/delete-document',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1aXBya2pydmdsbXJ5dG92amJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzMzAwNCwiZXhwIjoyMDcwNTA5MDA0fQ.SKywnjt9HJuZkKfyoWp6bBVRmQIGEEcbylExxOfKtOI"}'::jsonb,
    body:=jsonb_build_object(
      'file_path', OLD.name,
      'user_id', OLD.owner
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_storage_object_deleted
  AFTER DELETE ON storage.objects
  FOR EACH ROW
  WHEN (OLD.bucket_id = 'alma')
  EXECUTE PROCEDURE public.handle_storage_delete();
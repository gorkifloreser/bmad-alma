CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.handle_storage_object_created()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new object is created, invoke the process-document Edge Function
  PERFORM net.http_post(
    url:=current_setting('supabase.url') || '/functions/v1/process-document',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
    body:=jsonb_build_object('record', NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_storage_object_created
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE PROCEDURE private.handle_storage_object_created();

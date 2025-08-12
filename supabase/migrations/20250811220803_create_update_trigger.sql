CREATE OR REPLACE FUNCTION private.handle_storage_object_updated()
RETURNS TRIGGER AS $$
BEGIN
  -- When an object is updated, invoke the update-document Edge Function
  PERFORM net.http_post(
    url:=current_setting('supabase.url') || '/functions/v1/update-document',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
    body:=jsonb_build_object('record', NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_storage_object_updated
  AFTER UPDATE ON storage.objects
  FOR EACH ROW
  EXECUTE PROCEDURE private.handle_storage_object_updated();

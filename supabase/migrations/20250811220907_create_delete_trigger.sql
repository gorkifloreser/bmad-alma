CREATE OR REPLACE FUNCTION private.handle_storage_object_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- When an object is deleted, invoke the delete-document Edge Function
  PERFORM net.http_post(
    url:=current_setting('supabase.url') || '/functions/v1/delete-document',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
    body:=jsonb_build_object('record', OLD)
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_storage_object_deleted
  AFTER DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE PROCEDURE private.handle_storage_object_deleted();

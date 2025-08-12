-- Drop the existing storage triggers and their backing functions
DROP TRIGGER IF EXISTS on_storage_object_inserted ON storage.objects;
DROP TRIGGER IF EXISTS on_storage_object_updated ON storage.objects;
DROP TRIGGER IF EXISTS on_storage_object_deleted ON storage.objects;

DROP FUNCTION IF EXISTS public.handle_storage_insert();
DROP FUNCTION IF EXISTS public.handle_storage_update();
DROP FUNCTION IF EXISTS public.handle_storage_delete();

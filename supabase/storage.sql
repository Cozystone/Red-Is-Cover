INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-images', 'project-images', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Public can view project images'
  ) THEN
    CREATE POLICY "Public can view project images"
      ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Anyone can upload project images'
  ) THEN
    CREATE POLICY "Anyone can upload project images"
      ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images');
  END IF;
END $$;

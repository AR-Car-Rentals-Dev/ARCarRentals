-- Create a public storage bucket for email assets (hero image, logo, etc.)
-- This allows emails to load images directly from Supabase Storage

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'email-assets',
  'email-assets',
  true,  -- Public bucket so images can be accessed without authentication
  5242880,  -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow public read access (so email clients can load images)
CREATE POLICY "Public read access for email assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'email-assets');

-- Allow authenticated users to upload (admins can add new assets)
CREATE POLICY "Authenticated users can upload email assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'email-assets');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update email assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'email-assets')
WITH CHECK (bucket_id = 'email-assets');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete email assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'email-assets');

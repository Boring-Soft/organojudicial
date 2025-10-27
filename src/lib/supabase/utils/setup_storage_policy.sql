-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);

-- Allow public access to view avatars
CREATE POLICY "Allow public viewing of avatars" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'avatars');
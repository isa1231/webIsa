INSERT INTO storage.buckets (id, name, public)
VALUES ('shopbella-assets', 'shopbella-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "ShopBella logo is publicly readable" ON storage.objects;
CREATE POLICY "ShopBella logo is publicly readable"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'shopbella-assets'
  AND name = 'branding/shopbella-logo'
);

DROP POLICY IF EXISTS "Authenticated users can upload ShopBella logo" ON storage.objects;
CREATE POLICY "Authenticated users can upload ShopBella logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shopbella-assets'
  AND name = 'branding/shopbella-logo'
);

DROP POLICY IF EXISTS "Authenticated users can update ShopBella logo" ON storage.objects;
CREATE POLICY "Authenticated users can update ShopBella logo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shopbella-assets'
  AND name = 'branding/shopbella-logo'
)
WITH CHECK (
  bucket_id = 'shopbella-assets'
  AND name = 'branding/shopbella-logo'
);

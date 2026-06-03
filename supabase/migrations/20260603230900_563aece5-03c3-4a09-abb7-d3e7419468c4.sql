
-- Storage policies for book-pdfs bucket
CREATE POLICY "Authenticated users can read book pdfs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'book-pdfs');

CREATE POLICY "Admins can upload book pdfs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'book-pdfs' AND public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Admins can update book pdfs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'book-pdfs' AND public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Admins can delete book pdfs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'book-pdfs' AND public.is_admin_or_owner(auth.uid()));

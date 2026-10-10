-- Soft-deleted board posts must not be readable via the API. The client
-- filters is_deleted=false, but the SELECT policies allowed everything, so
-- removed (abusive) content stayed fetchable. Admins still see all rows.

DROP POLICY IF EXISTS "Anyone can read board threads" ON public.board_threads;
CREATE POLICY "Anyone can read live board threads" ON public.board_threads
  FOR SELECT USING (is_deleted = false OR public.is_admin_or_owner(auth.uid()));

DROP POLICY IF EXISTS "Anyone can read board replies" ON public.board_replies;
CREATE POLICY "Anyone can read live board replies" ON public.board_replies
  FOR SELECT USING (is_deleted = false OR public.is_admin_or_owner(auth.uid()));

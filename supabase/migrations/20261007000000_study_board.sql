-- Anonymous study board (4chan-style Q&A): students post questions under
-- auto aliases; admins can delete anything. Images via board-uploads bucket.

CREATE TABLE IF NOT EXISTS public.board_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  alias text NOT NULL,
  email text NOT NULL,
  reply_count int NOT NULL DEFAULT 0,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.board_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.board_threads(id) ON DELETE CASCADE,
  body text NOT NULL,
  image_url text,
  alias text NOT NULL,
  email text NOT NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS board_threads_subject_idx ON public.board_threads (subject, created_at DESC);
CREATE INDEX IF NOT EXISTS board_threads_created_idx ON public.board_threads (created_at DESC);
CREATE INDEX IF NOT EXISTS board_replies_thread_idx ON public.board_replies (thread_id, created_at);

ALTER TABLE public.board_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_replies ENABLE ROW LEVEL SECURITY;

-- Everyone (even signed-out visitors) can read live posts
CREATE POLICY "Anyone can read board threads" ON public.board_threads
  FOR SELECT USING (true);
CREATE POLICY "Anyone can read board replies" ON public.board_replies
  FOR SELECT USING (true);

-- Signed-in users can post under their account (alias shown publicly)
CREATE POLICY "Users can create threads" ON public.board_threads
  FOR INSERT TO authenticated
  WITH CHECK (email = public.get_auth_email());
CREATE POLICY "Users can create replies" ON public.board_replies
  FOR INSERT TO authenticated
  WITH CHECK (email = public.get_auth_email());

-- Only admins can edit/delete (soft-delete via is_deleted)
CREATE POLICY "Admins can manage threads" ON public.board_threads
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner(auth.uid()))
  WITH CHECK (public.is_admin_or_owner(auth.uid()));
CREATE POLICY "Admins can manage replies" ON public.board_replies
  FOR ALL TO authenticated
  USING (public.is_admin_or_owner(auth.uid()))
  WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- Image uploads for board posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('board-uploads', 'board-uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read board uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'board-uploads');
CREATE POLICY "Users can upload board images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'board-uploads');
CREATE POLICY "Admins can delete board uploads" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'board-uploads' AND public.is_admin_or_owner(auth.uid()));

-- Keep reply counts accurate server-side (posters can't UPDATE threads)
CREATE OR REPLACE FUNCTION public.bump_board_reply_count()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE board_threads SET reply_count = reply_count + 1 WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS board_reply_count_trigger ON public.board_replies;
CREATE TRIGGER board_reply_count_trigger
  AFTER INSERT ON public.board_replies
  FOR EACH ROW EXECUTE FUNCTION public.bump_board_reply_count();

-- Realtime thread + reply streams
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'board_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.board_threads;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'board_replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.board_replies;
  END IF;
END
$$;

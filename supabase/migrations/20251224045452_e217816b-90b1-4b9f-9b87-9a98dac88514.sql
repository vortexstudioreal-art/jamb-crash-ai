-- Create novels table for all JAMB literary texts
CREATE TABLE public.novels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general_reading',
  difficulty_level TEXT DEFAULT 'medium',
  is_premium BOOLEAN DEFAULT false,
  total_chapters INTEGER DEFAULT 0,
  subject TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create novel_chapters table
CREATE TABLE public.novel_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id UUID REFERENCES public.novels(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  estimated_reading_time INTEGER DEFAULT 5,
  likely_questions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_novel_progress table
CREATE TABLE public.user_novel_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  novel_id UUID REFERENCES public.novels(id) ON DELETE CASCADE NOT NULL,
  current_chapter_id UUID REFERENCES public.novel_chapters(id),
  progress_percent INTEGER DEFAULT 0,
  total_time_spent_seconds INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email, novel_id)
);

-- Create user_bookmarks table
CREATE TABLE public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  novel_id UUID REFERENCES public.novels(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.novel_chapters(id) ON DELETE CASCADE NOT NULL,
  scroll_position INTEGER DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novel_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_novel_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Novels: Anyone can read
CREATE POLICY "Anyone can read novels"
ON public.novels FOR SELECT
USING (true);

-- Novels: Only admins can manage
CREATE POLICY "Admins can manage novels"
ON public.novels FOR ALL
USING (is_admin_or_owner(auth.uid()))
WITH CHECK (is_admin_or_owner(auth.uid()));

-- Novel chapters: Anyone can read
CREATE POLICY "Anyone can read chapters"
ON public.novel_chapters FOR SELECT
USING (true);

-- Novel chapters: Only admins can manage
CREATE POLICY "Admins can manage chapters"
ON public.novel_chapters FOR ALL
USING (is_admin_or_owner(auth.uid()))
WITH CHECK (is_admin_or_owner(auth.uid()));

-- User novel progress policies
CREATE POLICY "Users can view own novel progress"
ON public.user_novel_progress FOR SELECT
USING (email = get_auth_email() OR is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can insert own novel progress"
ON public.user_novel_progress FOR INSERT
WITH CHECK (email = get_auth_email());

CREATE POLICY "Users can update own novel progress"
ON public.user_novel_progress FOR UPDATE
USING (email = get_auth_email());

CREATE POLICY "Users can delete own novel progress"
ON public.user_novel_progress FOR DELETE
USING (email = get_auth_email());

-- User bookmarks policies
CREATE POLICY "Users can view own bookmarks"
ON public.user_bookmarks FOR SELECT
USING (email = get_auth_email() OR is_admin_or_owner(auth.uid()));

CREATE POLICY "Users can insert own bookmarks"
ON public.user_bookmarks FOR INSERT
WITH CHECK (email = get_auth_email());

CREATE POLICY "Users can update own bookmarks"
ON public.user_bookmarks FOR UPDATE
USING (email = get_auth_email());

CREATE POLICY "Users can delete own bookmarks"
ON public.user_bookmarks FOR DELETE
USING (email = get_auth_email());

-- Create indexes for better performance
CREATE INDEX idx_novel_chapters_novel_id ON public.novel_chapters(novel_id);
CREATE INDEX idx_novel_chapters_chapter_number ON public.novel_chapters(novel_id, chapter_number);
CREATE INDEX idx_user_novel_progress_email ON public.user_novel_progress(email);
CREATE INDEX idx_user_novel_progress_novel ON public.user_novel_progress(novel_id);
CREATE INDEX idx_user_bookmarks_email ON public.user_bookmarks(email);
CREATE INDEX idx_novels_category ON public.novels(category);
CREATE INDEX idx_novels_year ON public.novels(year);

-- Trigger for updated_at on user_novel_progress
CREATE TRIGGER update_user_novel_progress_updated_at
BEFORE UPDATE ON public.user_novel_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on novels
CREATE TRIGGER update_novels_updated_at
BEFORE UPDATE ON public.novels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
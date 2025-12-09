-- Create jamb_syllabus table for structured syllabus data
CREATE TABLE IF NOT EXISTS public.jamb_syllabus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  subtopic TEXT,
  objectives TEXT[],
  recommended_content TEXT,
  difficulty_level TEXT DEFAULT 'medium',
  estimated_reading_time INTEGER DEFAULT 30, -- in minutes
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reading_sessions table to track reading time
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  syllabus_id UUID REFERENCES public.jamb_syllabus(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reading_progress table for tracking completion
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  syllabus_id UUID REFERENCES public.jamb_syllabus(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  progress_percent INTEGER DEFAULT 0,
  times_reviewed INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE,
  mastery_level TEXT DEFAULT 'not_started', -- not_started, learning, reviewing, mastered
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email, syllabus_id)
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  front TEXT NOT NULL, -- question/term
  back TEXT NOT NULL, -- answer/definition
  source_type TEXT DEFAULT 'ai', -- ai, syllabus, mistake, manual
  source_id UUID, -- reference to question/syllabus that generated it
  difficulty TEXT DEFAULT 'medium',
  times_reviewed INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  mastery_level TEXT DEFAULT 'new', -- new, learning, reviewing, mastered
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_study_preferences table for personalized study plans
CREATE TABLE IF NOT EXISTS public.user_study_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  study_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  hours_per_session INTEGER DEFAULT 2,
  preferred_subjects TEXT[],
  target_score INTEGER DEFAULT 300,
  exam_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.jamb_syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_study_preferences ENABLE ROW LEVEL SECURITY;

-- Jamb syllabus is public read, admin write
CREATE POLICY "Anyone can read syllabus" ON public.jamb_syllabus FOR SELECT USING (true);
CREATE POLICY "Admins can manage syllabus" ON public.jamb_syllabus FOR ALL USING (is_admin_or_owner(auth.uid())) WITH CHECK (is_admin_or_owner(auth.uid()));

-- Reading sessions - users can CRUD their own
CREATE POLICY "Users can view own reading sessions" ON public.reading_sessions FOR SELECT USING ((email = get_auth_email()) OR is_admin_or_owner(auth.uid()));
CREATE POLICY "Users can insert own reading sessions" ON public.reading_sessions FOR INSERT WITH CHECK (email = get_auth_email());
CREATE POLICY "Users can update own reading sessions" ON public.reading_sessions FOR UPDATE USING (email = get_auth_email());
CREATE POLICY "Users can delete own reading sessions" ON public.reading_sessions FOR DELETE USING (email = get_auth_email());

-- Reading progress - users can CRUD their own
CREATE POLICY "Users can view own reading progress" ON public.reading_progress FOR SELECT USING ((email = get_auth_email()) OR is_admin_or_owner(auth.uid()));
CREATE POLICY "Users can insert own reading progress" ON public.reading_progress FOR INSERT WITH CHECK (email = get_auth_email());
CREATE POLICY "Users can update own reading progress" ON public.reading_progress FOR UPDATE USING (email = get_auth_email());
CREATE POLICY "Users can delete own reading progress" ON public.reading_progress FOR DELETE USING (email = get_auth_email());

-- Flashcards - users can CRUD their own
CREATE POLICY "Users can view own flashcards" ON public.flashcards FOR SELECT USING ((email = get_auth_email()) OR is_admin_or_owner(auth.uid()));
CREATE POLICY "Users can insert own flashcards" ON public.flashcards FOR INSERT WITH CHECK (email = get_auth_email());
CREATE POLICY "Users can update own flashcards" ON public.flashcards FOR UPDATE USING (email = get_auth_email());
CREATE POLICY "Users can delete own flashcards" ON public.flashcards FOR DELETE USING (email = get_auth_email());

-- User study preferences - users can CRUD their own
CREATE POLICY "Users can view own study preferences" ON public.user_study_preferences FOR SELECT USING ((email = get_auth_email()) OR is_admin_or_owner(auth.uid()));
CREATE POLICY "Users can insert own study preferences" ON public.user_study_preferences FOR INSERT WITH CHECK (email = get_auth_email());
CREATE POLICY "Users can update own study preferences" ON public.user_study_preferences FOR UPDATE USING (email = get_auth_email());
CREATE POLICY "Users can delete own study preferences" ON public.user_study_preferences FOR DELETE USING (email = get_auth_email());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reading_sessions_email ON public.reading_sessions(email);
CREATE INDEX IF NOT EXISTS idx_reading_progress_email ON public.reading_progress(email);
CREATE INDEX IF NOT EXISTS idx_flashcards_email ON public.flashcards(email);
CREATE INDEX IF NOT EXISTS idx_flashcards_subject ON public.flashcards(subject);
CREATE INDEX IF NOT EXISTS idx_jamb_syllabus_subject ON public.jamb_syllabus(subject);
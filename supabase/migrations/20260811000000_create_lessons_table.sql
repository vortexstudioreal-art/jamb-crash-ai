-- Structured lessons table for the new learning environment
-- Coexists with jamb_syllabus during transition

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  topic text NOT NULL,
  subtopic text NOT NULL,
  title text NOT NULL,
  
  learning_objectives jsonb DEFAULT '[]'::jsonb,
  difficulty_level text DEFAULT 'medium',
  estimated_minutes integer DEFAULT 15,
  
  content_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  practice_questions jsonb DEFAULT '[]'::jsonb,
  
  mastery_criteria jsonb DEFAULT '{"min_score": 80, "required_sections": []}'::jsonb,
  
  version integer DEFAULT 1,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for querying by subject/topic
CREATE INDEX IF NOT EXISTS idx_lessons_subject ON lessons(subject);
CREATE INDEX IF NOT EXISTS idx_lessons_topic ON lessons(subject, topic);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_unique_topic ON lessons(subject, topic, subtopic);

-- Lesson progress tracking per student
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  
  sections_viewed jsonb DEFAULT '[]'::jsonb,
  predictions jsonb DEFAULT '[]'::jsonb,
  
  practice_attempts jsonb DEFAULT '[]'::jsonb,
  practice_score numeric DEFAULT 0,
  
  mastery_level text DEFAULT 'not_started' CHECK (mastery_level IN ('not_started', 'learning', 'reviewing', 'mastered')),
  mastery_score numeric DEFAULT 0,
  
  time_spent_seconds integer DEFAULT 0,
  last_accessed_at timestamptz,
  completed_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(email, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_email ON lesson_progress(email);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- RLS policies
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Anyone can read published lessons
CREATE POLICY "Published lessons are viewable by everyone"
  ON lessons FOR SELECT
  USING (status = 'published');

-- Lesson progress: users can read/update their own
CREATE POLICY "Users can view own lesson progress"
  ON lesson_progress FOR SELECT
  USING (auth.email() = email);

CREATE POLICY "Users can insert own lesson progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.email() = email);

CREATE POLICY "Users can update own lesson progress"
  ON lesson_progress FOR UPDATE
  USING (auth.email() = email);

-- Service role can manage everything (for seed functions)
CREATE POLICY "Service role full access on lessons"
  ON lessons FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on lesson_progress"
  ON lesson_progress FOR ALL
  USING (true)
  WITH CHECK (true);

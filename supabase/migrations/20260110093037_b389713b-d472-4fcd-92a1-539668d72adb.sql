-- Create leaderboard scores table
CREATE TABLE public.leaderboard_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  total_score integer NOT NULL DEFAULT 0,
  questions_answered integer NOT NULL DEFAULT 0,
  average_accuracy decimal(5,2) DEFAULT 0,
  best_quiz_score integer DEFAULT 0,
  rank integer,
  is_placeholder boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view leaderboard
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard_scores FOR SELECT TO authenticated
USING (true);

-- Users can insert their own scores
CREATE POLICY "Users can insert own score"
ON public.leaderboard_scores FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own scores
CREATE POLICY "Users can update own score"
ON public.leaderboard_scores FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_leaderboard_scores_updated_at
BEFORE UPDATE ON public.leaderboard_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 10 placeholder entries with Nigerian names
INSERT INTO public.leaderboard_scores (full_name, email, total_score, questions_answered, average_accuracy, best_quiz_score, is_placeholder, rank)
VALUES 
  ('Adebayo O.', 'placeholder1@jambcrash.internal', 285, 120, 71.25, 95, true, 1),
  ('Chidinma N.', 'placeholder2@jambcrash.internal', 278, 115, 69.50, 92, true, 2),
  ('Emeka K.', 'placeholder3@jambcrash.internal', 265, 110, 66.25, 88, true, 3),
  ('Fatima A.', 'placeholder4@jambcrash.internal', 258, 108, 64.50, 85, true, 4),
  ('Gideon M.', 'placeholder5@jambcrash.internal', 245, 100, 61.25, 82, true, 5),
  ('Halima B.', 'placeholder6@jambcrash.internal', 238, 95, 59.50, 80, true, 6),
  ('Ibrahim S.', 'placeholder7@jambcrash.internal', 225, 90, 56.25, 78, true, 7),
  ('Joy U.', 'placeholder8@jambcrash.internal', 218, 88, 54.50, 75, true, 8),
  ('Kelvin C.', 'placeholder9@jambcrash.internal', 205, 85, 51.25, 72, true, 9),
  ('Lola D.', 'placeholder10@jambcrash.internal', 198, 82, 49.50, 70, true, 10);
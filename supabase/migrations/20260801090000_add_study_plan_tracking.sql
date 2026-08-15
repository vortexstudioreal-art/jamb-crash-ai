-- Study plan tracking: persisted AI plans + per-task completion for
-- calendar/reminder follow-up. Email-based RLS via public.get_auth_email().

-- Persisted study plans (one active per user; new plans archive the old)
CREATE TABLE IF NOT EXISTS public.study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  plan_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  target_score int NOT NULL DEFAULT 300,
  hours_per_day int NOT NULL DEFAULT 4,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS study_plans_email_idx ON public.study_plans (email, created_at DESC);

-- Individual study sessions (one row per subject per planned day)
CREATE TABLE IF NOT EXISTS public.study_plan_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  day integer NOT NULL,
  date date NOT NULL,
  day_name text NOT NULL,
  subject text NOT NULL,
  topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  quiz_goal integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, day, subject)
);

CREATE INDEX IF NOT EXISTS study_plan_tasks_plan_idx ON public.study_plan_tasks (plan_id);
CREATE INDEX IF NOT EXISTS study_plan_tasks_date_idx ON public.study_plan_tasks (date);

-- RLS
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plan_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own study plans" ON public.study_plans
  FOR SELECT TO authenticated
  USING (email = public.get_auth_email());

CREATE POLICY "Users can create own study plans" ON public.study_plans
  FOR INSERT TO authenticated
  WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Users can update own study plans" ON public.study_plans
  FOR UPDATE TO authenticated
  USING (email = public.get_auth_email())
  WITH CHECK (email = public.get_auth_email());

CREATE POLICY "Users can delete own study plans" ON public.study_plans
  FOR DELETE TO authenticated
  USING (email = public.get_auth_email());

CREATE POLICY "Users can read own plan tasks" ON public.study_plan_tasks
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.study_plans p
    WHERE p.id = plan_id AND p.email = public.get_auth_email()
  ));

CREATE POLICY "Users can create own plan tasks" ON public.study_plan_tasks
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.study_plans p
    WHERE p.id = plan_id AND p.email = public.get_auth_email()
  ));

CREATE POLICY "Users can update own plan tasks" ON public.study_plan_tasks
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.study_plans p
    WHERE p.id = plan_id AND p.email = public.get_auth_email()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.study_plans p
    WHERE p.id = plan_id AND p.email = public.get_auth_email()
  ));

CREATE POLICY "Users can delete own plan tasks" ON public.study_plan_tasks
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.study_plans p
    WHERE p.id = plan_id AND p.email = public.get_auth_email()
  ));

-- Users may insert notifications targeted at themselves (study-plan reminders,
-- previously admin-only). Global notifications remain admin-only.
CREATE POLICY "Users can create self-targeted notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (target_email = public.get_auth_email() AND is_global = false);

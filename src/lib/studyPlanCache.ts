// Local fallback cache for the AI study plan.
//
// The calendar (StudyPlanTracker) and the "Stick to a study plan" card
// (StudyPlanTodayCard) normally read from the `study_plans` /
// `study_plan_tasks` tables. When that save fails — offline, RLS denial,
// inactive Supabase project — the user just generated a plan but the
// calendar shows "No Active Study Plan" and the Follow button never
// appears. Caching the plan locally keeps the whole flow working and the
// DB remains the source of truth whenever it is reachable.

export interface CachedDaySubject {
  name: string;
  topics: string[];
  duration: string;
  priority: string;
  quizGoal: number;
}

export interface CachedPlanDay {
  day: number;
  date: string;
  isoDate: string;
  dayName: string;
  focusArea: string;
  totalHours: number;
  subjects: CachedDaySubject[];
}

export interface CachedStudyPlan {
  id: string;
  plan_data: CachedPlanDay[];
  target_score: number;
  hours_per_day: number;
  status: string;
  created_at: string;
}

export type ProgressMap = Record<string, { completed: boolean; completed_at: string | null }>;

const planKey = (email: string) => `jamb_study_plan_${email.toLowerCase()}`;
const progressKey = (planId: string) => `jamb_study_progress_${planId}`;

/** Task identity stable across reloads (synthetic ids are not). */
export const localTaskKey = (day: number, subject: string) => `${day}::${subject}`;

export const saveLocalPlan = (
  email: string,
  plan_data: CachedPlanDay[],
  target_score: number,
  hours_per_day: number,
): CachedStudyPlan => {
  const plan: CachedStudyPlan = {
    id: `local-${Date.now()}`,
    plan_data,
    target_score,
    hours_per_day,
    status: 'active',
    created_at: new Date().toISOString(),
  };
  try {
    localStorage.setItem(planKey(email), JSON.stringify(plan));
    // Fresh plan → fresh progress.
    localStorage.removeItem(progressKey(plan.id));
  } catch {
    // Storage full / private mode — calendar still works for this session
    // via in-memory state; persistence is best-effort.
  }
  return plan;
};

export const loadLocalPlan = (email: string): CachedStudyPlan | null => {
  try {
    const raw = localStorage.getItem(planKey(email));
    if (!raw) return null;
    const plan = JSON.parse(raw) as CachedStudyPlan;
    if (!plan || !Array.isArray(plan.plan_data) || plan.plan_data.length === 0) return null;
    return plan;
  } catch {
    return null;
  }
};

export const setLocalPlanStatus = (email: string, status: string): void => {
  try {
    const plan = loadLocalPlan(email);
    if (!plan) return;
    localStorage.setItem(planKey(email), JSON.stringify({ ...plan, status }));
  } catch {
    // best-effort
  }
};

export const loadProgress = (planId: string): ProgressMap => {
  try {
    const raw = localStorage.getItem(progressKey(planId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const saveProgress = (planId: string, progress: ProgressMap): void => {
  try {
    localStorage.setItem(progressKey(planId), JSON.stringify(progress));
  } catch {
    // best-effort
  }
};

export interface PlanFollowup {
  completedSessions: number;
  totalSessions: number;
  missed: Array<{ subject: string; topics: string[] }>;
  completedTopics: string[];
  savedAt: number;
}

const FOLLOWUP_KEY = 'study_plan_followup_v1';

export const writePlanFollowup = (f: PlanFollowup) => {
  try {
    localStorage.setItem(FOLLOWUP_KEY, JSON.stringify(f));
  } catch {
    // storage unavailable — generator simply starts fresh
  }
};

/** Read once and clear, so a stale handoff never biases a later plan. */
export const consumePlanFollowup = (): PlanFollowup | null => {
  try {
    const raw = localStorage.getItem(FOLLOWUP_KEY);
    localStorage.removeItem(FOLLOWUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlanFollowup;
    if (!parsed || !Array.isArray(parsed.missed)) return null;
    return parsed;
  } catch {
    return null;
  }
};

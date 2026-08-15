import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, ShieldCheck, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useJambScorePredictor } from '@/hooks/useJambScorePredictor';

interface QuizAttempt {
  id: string;
  subjects: string[];
  correct_answers: number;
  total_questions: number;
  created_at: string;
  questions_data?: Array<{
    subject?: string;
    userAnswer?: string;
    correct_answer?: string;
    isCorrect?: boolean;
  }>;
}

interface HomeSummaryProps {
  userEmail: string | null;
  dailyGoal?: number;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const HomeSummary = ({ userEmail, dailyGoal = 20 }: HomeSummaryProps) => {
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (!userEmail) return;
    (async () => {
      const { data } = await supabase
        .from('quiz_attempts')
        .select('id, subjects, correct_answers, total_questions, created_at, questions_data')
        .eq('email', userEmail)
        .order('created_at', { ascending: false });
      if (data) setQuizzes(data as QuizAttempt[]);
    })();
  }, [userEmail]);

  const prediction = useJambScorePredictor(quizzes);

  // Today's questions answered
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = quizzes
    .filter((q) => new Date(q.created_at) >= todayStart)
    .reduce((sum, q) => sum + q.total_questions, 0);
  const goalPct = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

  // Streak: consecutive days with any quiz activity ending today (or yesterday if none today)
  const dayKeys = new Set(
    quizzes.map((q) => {
      const d = new Date(q.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!dayKeys.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 1);
  while (dayKeys.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Weekly streak dots (Mon..Sun of current week starting Monday)
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sun
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() + mondayOffset);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      label: DAY_LABELS[d.getDay()],
      active: dayKeys.has(d.getTime()),
      isFuture: d.getTime() > now.setHours(0, 0, 0, 0),
    };
  });

  // Confidence dial angle (0-360)
  const dialPct = Math.round(prediction.confidenceValue * 100);
  const confidenceLabel =
    prediction.confidence === 'high' ? 'High' : prediction.confidence === 'medium' ? 'Medium' : 'Low';

  const hasEnoughData = prediction.totalQuestions >= 5;

  return (
    <div className="space-y-4">
      {/* Predicted Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary">Predicted JAMB Score</span>
            </div>
            {hasEnoughData ? (
              <>
                <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-none">
                  {prediction.minScore} – {prediction.maxScore}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {prediction.baseScore >= 250 ? "You're on the right track!" : 'Keep practicing to boost it!'}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">Take a quiz</div>
                <p className="text-xs text-muted-foreground mt-2">Answer 5+ questions to unlock your prediction.</p>
              </>
            )}
          </div>

          {/* Confidence dial */}
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(var(--primary) / 0.15)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(dialPct / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary mb-0.5" />
              <span className="text-sm font-bold text-primary leading-none">{confidenceLabel}</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">Confidence</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Streak + Goal row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Study Streak</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-foreground">{streak}</span>
            <span className="text-xs text-primary font-semibold">days</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">
            {streak > 0 ? 'Keep it up!' : 'Start today!'}
          </p>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] ' +
                    (d.active
                      ? 'bg-primary text-primary-foreground'
                      : d.isFuture
                      ? 'bg-muted/40 text-muted-foreground'
                      : 'bg-muted text-muted-foreground')
                  }
                >
                  {d.active ? <Check className="w-3 h-3" /> : ''}
                </div>
                <span className="text-[9px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-4 border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Today's Goal</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-foreground">{todayCount}</span>
            <span className="text-xs text-muted-foreground">/ {dailyGoal}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">Questions</p>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{goalPct}% Completed</p>
        </div>
      </div>
    </div>
  );
};
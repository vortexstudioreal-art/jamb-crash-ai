import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Crosshair, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';

interface WeakTopicDrillProps {
  userEmail: string;
  subjects: string[];
  canPractice: boolean;
  onDrillSubject: (subject: string) => void;
  onUpgrade: () => void;
}

interface SubjectStat {
  subject: string;
  correct: number;
  total: number;
}

const MIN_QUESTIONS = 5;

const prettySubject = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const WeakTopicDrill = ({
  userEmail,
  subjects,
  canPractice,
  onDrillSubject,
  onUpgrade,
}: WeakTopicDrillProps) => {
  const [stats, setStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('quiz_attempts')
          .select('subjects, questions_data')
          .eq('email', userEmail)
          .order('created_at', { ascending: false })
          .limit(50);

        const bySubject: Record<string, { correct: number; total: number }> = {};
        for (const attempt of data || []) {
          const rows = Array.isArray(attempt.questions_data) ? attempt.questions_data : [];
          if (rows.length > 0) {
            for (const q of rows as Array<{ subject?: string; userAnswer?: string; correct_answer?: string }>) {
              const subject = q.subject || (attempt.subjects as string[])?.[0];
              if (!subject) continue;
              if (!bySubject[subject]) bySubject[subject] = { correct: 0, total: 0 };
              bySubject[subject].total += 1;
              if (
                q.userAnswer &&
                q.correct_answer &&
                q.userAnswer.toUpperCase() === q.correct_answer.toUpperCase()
              ) {
                bySubject[subject].correct += 1;
              }
            }
          }
        }
        const list = Object.entries(bySubject)
          .map(([subject, s]) => ({ subject, ...s }))
          .filter((s) => s.total >= MIN_QUESTIONS && subjects.includes(s.subject))
          .sort((a, b) => a.correct / a.total - b.correct / b.total);
        setStats(list);
      } catch (err) {
        errorLogger.error(err, { component: 'WeakTopicDrill', action: 'load stats' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userEmail, subjects]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Finding your weakest link…</p>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Crosshair className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Weak-Link Drill</h3>
          <p className="text-sm text-muted-foreground">
            Answer {MIN_QUESTIONS}+ questions per subject and I'll build you a personal drill for your weakest area.
          </p>
        </div>
      </div>
    );
  }

  const weakest = stats[0];
  const weakestPct = Math.round((weakest.correct / weakest.total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 border border-red-500/30 bg-gradient-to-r from-red-500/10 to-orange-500/5"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
          <Target className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground">
            Weakest link: {prettySubject(weakest.subject)} ({weakestPct}%)
          </h3>
          <p className="text-sm text-muted-foreground">
            {weakest.correct}/{weakest.total} right in recent quizzes. Drill it now?
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {stats.slice(0, 4).map((s) => {
          const pct = Math.round((s.correct / s.total) * 100);
          return (
            <div key={s.subject} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-28 truncate">{prettySubject(s.subject)}</span>
              <Progress value={pct} className="flex-1 h-1.5" />
              <span className="text-xs font-bold w-9 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
      {canPractice ? (
        <Button onClick={() => onDrillSubject(weakest.subject)} className="w-full mt-4" variant="default">
          <Crosshair className="w-4 h-4 mr-2" />
          Drill {prettySubject(weakest.subject)} Now
        </Button>
      ) : (
        <Button onClick={onUpgrade} className="w-full mt-4" variant="outline">
          <Lock className="w-4 h-4 mr-2" />
          Unlock Drills with ACE
        </Button>
      )}
    </motion.div>
  );
};

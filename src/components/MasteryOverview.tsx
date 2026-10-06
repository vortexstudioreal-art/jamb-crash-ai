import { useEffect, useState } from 'react';
import { Target, TrendingUp, TrendingDown, Minus, Play, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { computeMastery, type SubjectMastery } from '@/lib/mastery';
import { errorLogger } from '@/services/errorLogger';
import { cn } from '@/lib/utils';

interface MasteryOverviewProps {
  userEmail: string;
  subjects: string[];
  canPractice: boolean;
  onPracticeSubject: (subject: string) => void;
  onUpgrade: () => void;
}

export const MasteryOverview = ({
  userEmail,
  subjects,
  canPractice,
  onPracticeSubject,
  onUpgrade,
}: MasteryOverviewProps) => {
  const [data, setData] = useState<SubjectMastery[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('questions_data, created_at')
          .eq('email', userEmail)
          .not('questions_data', 'is', null)
          .order('created_at', { ascending: false })
          .limit(100);
        if (cancelled) return;
        const samples =
          attempts?.flatMap((a) => {
            const qs = a.questions_data as unknown as
              | { subject?: string; question?: string; topics?: string[]; userAnswer?: string; correct_answer?: string }[]
              | null;
            if (!Array.isArray(qs)) return [];
            return qs.map((q) => ({
              subject: q.subject || '',
              text: q.question || '',
              storedTopics: q.topics,
              correct: q.userAnswer === q.correct_answer,
              at: a.created_at || new Date().toISOString(),
            }));
          }) || [];
        if (!cancelled) setData(computeMastery(samples, subjects));
      } catch (err) {
        errorLogger.error(err, { component: 'MasteryOverview', action: 'load mastery' });
        if (!cancelled) setData([]);
      }
    };
    if (userEmail) void load();
    return () => {
      cancelled = true;
    };
  }, [userEmail, subjects.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  if (data === null) {
    return (
      <div className="rounded-2xl p-5 border border-border bg-card animate-pulse">
        <div className="h-5 w-40 rounded-md bg-muted mb-3" />
        <div className="space-y-2">
          <div className="h-3 rounded-md bg-muted" />
          <div className="h-3 rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl p-5 border border-dashed border-border bg-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Topic Mastery</p>
          <p className="text-xs text-muted-foreground">Take a quiz and your per-topic mastery shows up here.</p>
        </div>
      </div>
    );
  }

  const weakestSubject = data[0];
  const weakestTopic = weakestSubject.weakest;

  return (
    <div className="rounded-2xl p-5 border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Topic Mastery</h3>
        </div>
        {weakestTopic && (
          <span className="text-xs text-muted-foreground">
            Weakest: <span className="font-medium text-foreground capitalize">{weakestTopic.topic}</span>
          </span>
        )}
      </div>

      <div className="space-y-2.5 mb-4">
        {data.map((s) => (
          <div key={s.subject}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="capitalize font-medium text-foreground flex items-center gap-1.5">
                {s.subject.replace('_', ' ')}
                {s.weakest && s.weakest.trend === 'improving' && (
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                )}
                {s.weakest && s.weakest.trend === 'declining' && (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                {s.weakest && s.weakest.trend === 'stable' && (
                  <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </span>
              <span
                className={cn(
                  'font-bold',
                  s.overall >= 80 ? 'text-green-500' : s.overall >= 60 ? 'text-primary' : s.overall >= 40 ? 'text-yellow-600' : 'text-red-500'
                )}
              >
                {s.overall}%
              </span>
            </div>
            <Progress value={s.overall} className="h-2" />
          </div>
        ))}
      </div>

      {canPractice ? (
        <Button
          onClick={() => onPracticeSubject(weakestSubject.subject)}
          className="w-full bg-gradient-to-r from-primary to-green-500 text-white"
        >
          <Play className="w-4 h-4 mr-2" />
          Practice weakest: <span className="capitalize ml-1">{weakestSubject.subject.replace('_', ' ')}</span>
        </Button>
      ) : (
        <Button onClick={onUpgrade} variant="outline" className="w-full relative">
          <Lock className="w-3 h-3 absolute top-1.5 right-1.5 text-muted-foreground" />
          <Play className="w-4 h-4 mr-2" />
          Practice weakest: <span className="capitalize ml-1">{weakestSubject.subject.replace('_', ' ')}</span>
        </Button>
      )}
    </div>
  );
};

import { useCallback, useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface StudyPlanTodayCardProps {
  userEmail: string;
  onOpenCalendar: () => void;
  onGenerate: () => void;
}

interface PlanTask {
  id: string;
  date: string;
  subject: string;
  topics: string[];
  duration: string | null;
  quiz_goal: number;
  completed: boolean;
  priority: string;
}

const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const StudyPlanTodayCard = ({ userEmail, onOpenCalendar, onGenerate }: StudyPlanTodayCardProps) => {
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data: planData } = await supabase
        .from('study_plans')
        .select('id')
        .eq('email', userEmail)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (!planData) {
        setHasPlan(false);
        setTasks([]);
        setLoading(false);
        return;
      }
      setHasPlan(true);
      const { data: taskData } = await supabase
        .from('study_plan_tasks')
        .select('id, date, subject, topics, duration, quiz_goal, completed, priority')
        .eq('plan_id', planData.id)
        .order('date', { ascending: true });
      if (!cancelled) setTasks((taskData ?? []) as unknown as PlanTask[]);
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  const today = toIsoDate(new Date());
  const todayTasks = tasks.filter((t) => t.date === today);
  const doneToday = todayTasks.filter((t) => t.completed).length;
  const totalDays = Array.from(new Set(tasks.map((t) => t.date))).length;
  const completedDays = Array.from(new Set(tasks.filter((t) => t.completed).map((t) => t.date))).length;

  if (loading) return null;

  if (!hasPlan) {
    return (
      <div className="rounded-2xl p-5 border border-primary/30 bg-gradient-to-r from-primary/10 to-green-500/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Stick to a study plan</p>
            <p className="text-xs text-muted-foreground">AI plan + calendar + daily reminders</p>
          </div>
        </div>
        <Button size="sm" onClick={onGenerate} className="bg-gradient-to-r from-primary to-green-500 text-white shrink-0">
          <Sparkles className="w-4 h-4 mr-1" />
          Create Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 border border-primary/30 bg-gradient-to-r from-primary/10 to-green-500/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground leading-tight">
              {todayTasks.length > 0 ? "Today's Study Plan" : 'Study Plan'}
            </p>
            <p className="text-xs text-muted-foreground">
              {todayTasks.length > 0
                ? `${doneToday} of ${todayTasks.length} sessions done`
                : `${completedDays}/${totalDays} study days completed`}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onOpenCalendar} className="shrink-0">
          Open Calendar
        </Button>
      </div>

      {todayTasks.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {todayTasks.map((task) => (
              <span
                key={task.id}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                  task.completed
                    ? 'border-green-500/40 bg-green-500/10 text-green-600'
                    : task.priority === 'high'
                    ? 'border-red-500/40 bg-red-500/10 text-red-500'
                    : 'border-primary/30 bg-primary/10 text-primary'
                }`}
              >
                {task.completed && <CheckCircle2 className="w-3 h-3" />}
                <span className="capitalize">{task.subject.replace('_', ' ')}</span>
                {task.duration && <span className="text-muted-foreground">· {task.duration}</span>}
              </span>
            ))}
          </div>
          <Progress value={todayTasks.length > 0 ? (doneToday / todayTasks.length) * 100 : 0} className="h-2" />
          {todayTasks.some((t) => !t.completed) && (
            <p className="text-xs text-primary mt-2 font-medium">Open your calendar and check off today's sessions 💪</p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No sessions planned today. Check your calendar for upcoming study days.
        </p>
      )}
    </div>
  );
};

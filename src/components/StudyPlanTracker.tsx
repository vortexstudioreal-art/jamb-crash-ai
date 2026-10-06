import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  BookMarked,
  
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  PartyPopper,
  Play,
  Sparkles,
  
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { showLocalNotification } from '@/lib/notify';
import {
  loadLocalPlan,
  loadProgress,
  localTaskKey,
  saveProgress,
  setLocalPlanStatus,
} from '@/lib/studyPlanCache';

interface StudyPlanTrackerProps {
  userEmail: string;
  onBack: () => void;
  onGenerateNew: () => void;
  onStartPractice: (subject: string) => void;
  onOpenSyllabus: (subject: string) => void;
  onOpenFlashcards: (subject: string) => void;
}

interface PlanDay {
  day: number;
  date: string;
  isoDate: string;
  dayName: string;
  focusArea: string;
  totalHours: number;
  subjects: {
    name: string;
    topics: string[];
    duration: string;
    priority: string;
    quizGoal: number;
  }[];
}

interface PlanTask {
  id: string;
  plan_id: string;
  day: number;
  date: string;
  day_name: string;
  subject: string;
  topics: string[];
  duration: string | null;
  priority: string;
  quiz_goal: number;
  completed: boolean;
  completed_at: string | null;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SUBJECT_COLORS: Record<string, string> = {
  english: 'bg-blue-500',
  mathematics: 'bg-purple-500',
  physics: 'bg-cyan-500',
  chemistry: 'bg-orange-500',
  biology: 'bg-green-500',
  literature: 'bg-rose-500',
  government: 'bg-amber-500',
  economics: 'bg-teal-500',
  geography: 'bg-lime-500',
  accounting: 'bg-indigo-500',
  commerce: 'bg-pink-500',
  crs: 'bg-yellow-500',
  irs: 'bg-emerald-500',
  agricultural_science: 'bg-red-500',
};

const COLOR_PALETTE = ['bg-blue-500', 'bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-green-500', 'bg-rose-500'];

const subjectColor = (subject: string, index: number) =>
  SUBJECT_COLORS[subject] || COLOR_PALETTE[index % COLOR_PALETTE.length];

const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayIso = () => toIsoDate(new Date());

const formatLongDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' });

export const StudyPlanTracker = ({
  userEmail,
  onBack,
  onGenerateNew,
  onStartPractice,
  onOpenSyllabus,
  onOpenFlashcards,
}: StudyPlanTrackerProps) => {
  const [plan, setPlan] = useState<{ id: string; plan_data: PlanDay[]; target_score: number; hours_per_day: number; status: string } | null>(null);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notifState, setNotifState] = useState<NotificationPermission | null>(
    typeof Notification !== 'undefined' ? Notification.permission : null
  );

  const tasksByDate = useMemo(() => {
    const map: Record<string, PlanTask[]> = {};
    tasks.forEach((t) => {
      (map[t.date] = map[t.date] || []).push(t);
    });
    return map;
  }, [tasks]);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    const { data: planData } = await supabase
      .from('study_plans')
      .select('id, plan_data, target_score, hours_per_day, status')
      .eq('email', userEmail)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planData) {
      setPlan({
        id: planData.id,
        plan_data: planData.plan_data as unknown as PlanDay[],
        target_score: planData.target_score ?? 300,
        hours_per_day: planData.hours_per_day ?? 4,
        status: planData.status,
      });
      const { data: taskData } = await supabase
        .from('study_plan_tasks')
        .select('*')
        .eq('plan_id', planData.id)
        .order('date', { ascending: true });
      setTasks((taskData ?? []) as unknown as PlanTask[]);
    } else {
      // No DB plan (offline / save failed / RLS) — fall back to the locally
      // cached plan so a just-generated plan still opens a calendar.
      const local = loadLocalPlan(userEmail);
      if (local && local.status === 'active') {
        const progress = loadProgress(local.id);
        const synth: PlanTask[] = [];
        local.plan_data.forEach((d) => {
          d.subjects.forEach((s, idx) => {
            const p = progress[localTaskKey(d.day, s.name)];
            synth.push({
              id: `local-${d.day}-${idx}`,
              plan_id: local.id,
              day: d.day,
              date: d.isoDate,
              day_name: d.dayName,
              subject: s.name,
              topics: s.topics,
              duration: s.duration,
              priority: s.priority,
              quiz_goal: s.quizGoal,
              completed: p?.completed ?? false,
              completed_at: p?.completed_at ?? null,
            });
          });
        });
        setPlan({
          id: local.id,
          plan_data: local.plan_data,
          target_score: local.target_score,
          hours_per_day: local.hours_per_day,
          status: local.status,
        });
        setTasks(synth);
      } else {
        setPlan(null);
        setTasks([]);
      }
    }
    setLoading(false);
  }, [userEmail]);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  const insertNotification = useCallback(
    async (title: string, message: string) => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('title', title)
        .eq('target_email', userEmail)
        .gte('created_at', startOfDay.toISOString())
        .limit(1);
      if (existing && existing.length > 0) return;
      await supabase.from('notifications').insert({
        title,
        message,
        type: 'study',
        is_global: false,
        target_email: userEmail,
      });
    },
    [userEmail]
  );

  useEffect(() => {
    if (!plan || tasks.length === 0) return;
    const today = todayIso();
    const todayTasks = tasksByDate[today] || [];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayIso = toIsoDate(yesterdayDate);
    const yesterdayTasks = tasksByDate[yesterdayIso] || [];

    if (yesterdayTasks.length > 0 && yesterdayTasks.some((t) => !t.completed)) {
      const missed = yesterdayTasks.filter((t) => !t.completed);
      const subjects = missed.map((t) => t.subject.replace('_', ' ')).join(', ');
      void insertNotification('Missed a study session', `You missed ${subjects} yesterday. Get back on track today!`);
    }

    if (todayTasks.length > 0 && todayTasks.some((t) => !t.completed)) {
      void insertNotification('Study time!', `You have ${todayTasks.length} study session${todayTasks.length > 1 ? 's' : ''} planned today. Check your calendar.`);
      const subjects = todayTasks.map((t) => t.subject.replace('_', ' ')).join(', ');
      void showLocalNotification("It's study time!", {
        body: `Today: ${subjects}`,
        tag: `study-reminder-${today}`,
      });
    }
  }, [plan, tasks, tasksByDate, insertNotification]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const plannedDates = useMemo(() => Array.from(new Set(tasks.map((t) => t.date))), [tasks]);
  const completedDates = plannedDates.filter((d) => (tasksByDate[d] || []).every((t) => t.completed));
  const allComplete = plannedDates.length > 0 && completedDates.length === plannedDates.length;

  const activeDate = useMemo(() => {
    if (selectedDate) return selectedDate;
    const today = todayIso();
    if (tasksByDate[today]?.length) return today;
    const upcoming = tasks.find((t) => t.date >= today);
    return upcoming ? upcoming.date : null;
  }, [selectedDate, tasksByDate, tasks]);

  const activeDayPlan = useMemo(
    () => (plan ? plan.plan_data.find((d) => d.isoDate === activeDate) : undefined),
    [plan, activeDate]
  );

  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return cells;
  }, [viewMonth]);

  const toggleTask = async (task: PlanTask) => {
    const next = !task.completed;
    const completedAt = next ? new Date().toISOString() : null;
    // Locally-cached plan (no DB row) — persist check-offs locally.
    if (task.id.startsWith('local-')) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: next, completed_at: completedAt } : t)));
      const progress = loadProgress(task.plan_id);
      progress[localTaskKey(task.day, task.subject)] = { completed: next, completed_at: completedAt };
      saveProgress(task.plan_id, progress);
      if (next) toast.success(`${task.subject.replace('_', ' ')} done!`);
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: next, completed_at: completedAt } : t)));
    const { error } = await supabase
      .from('study_plan_tasks')
      .update({ completed: next, completed_at: completedAt })
      .eq('id', task.id);
    if (error) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      toast.error('Failed to update task');
      return;
    }
    if (next) toast.success(`${task.subject.replace('_', ' ')} done!`);
  };

  const completePlan = async () => {
    if (!plan) return;
    // Locally-cached plan — mark complete locally instead of the DB.
    if (plan.id.startsWith('local-')) {
      setLocalPlanStatus(userEmail, 'completed');
      setPlan({ ...plan, status: 'completed' });
      toast.success('Study plan completed! 🎉');
      return;
    }
    const { error } = await supabase
      .from('study_plans')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', plan.id);
    if (error) {
      toast.error('Failed to complete plan');
      return;
    }
    setPlan({ ...plan, status: 'completed' });
    void insertNotification('Study plan completed! 🎉', `You finished your ${plannedDates.length}-day study plan. You're ready to crush JAMB!`);
    toast.success('Study plan completed! 🎉');
  };

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      toast.error('Notifications are not supported on this browser');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifState(permission);
    if (permission === 'granted') {
      await showLocalNotification('Jamb Crash AI', { body: 'We will remind you when it is study time!' });
      toast.success('Study reminders enabled!');
    } else {
      toast.error('Notifications blocked — enable them in your browser settings');
    }
  };

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading your study calendar...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="py-16">
            <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-6 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">No Active Study Plan</h1>
            <p className="text-muted-foreground mb-8">
              Generate an AI study plan and follow it right here — calendar, checklists, and reminders.
            </p>
            <Button size="lg" onClick={onGenerateNew} className="bg-gradient-to-r from-primary to-green-500 text-white">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate AI Study Plan
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (plan.status === 'completed') {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16"
          >
            <div className="w-20 h-20 rounded-full bg-green-500 mx-auto mb-6 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Plan Completed! 🎉</h1>
            <p className="text-muted-foreground mb-8">
              You finished your {plannedDates.length}-day study plan. Generate a fresh one to keep the momentum going.
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="lg" onClick={onGenerateNew} className="bg-gradient-to-r from-primary to-green-500 text-white">
                <Sparkles className="w-5 h-5 mr-2" />
                Generate New Plan
              </Button>
              <Button size="lg" variant="outline" onClick={onBack}>
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const today = todayIso();
  const todayTasks = tasksByDate[today] || [];
  const doneToday = todayTasks.filter((t) => t.completed).length;
  const nextTask = tasks.find((t) => !t.completed && t.date >= today);
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 bg-gradient-to-br from-primary via-primary/90 to-green-600 text-white shadow-lg shadow-primary/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold leading-tight">My Study Calendar</h1>
                <p className="text-white/80 text-xs md:text-sm">Follow your AI plan day by day</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold">{pct}%</p>
              <p className="text-white/80 text-xs">plan complete</p>
            </div>
          </div>
          <Progress
            value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
            className="h-3 bg-white/20 [&>div]:bg-white"
          />
          <div className="flex flex-wrap gap-2 mt-4 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-white/15 font-medium">
              {completedDates.length}/{plannedDates.length} days done
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/15 font-medium">
              {completedTasks}/{totalTasks} sessions
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/15 font-medium">
              Target {plan.target_score}+
            </span>
            {allComplete && (
              <button
                onClick={() => void completePlan()}
                className="px-3 py-1.5 rounded-full bg-white text-primary font-bold flex items-center gap-1"
              >
                <PartyPopper className="w-3.5 h-3.5" />
                Mark Complete
              </button>
            )}
          </div>
        </motion.div>

        {/* Today / Next session */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {todayTasks.length > 0 ? (
            <div className="rounded-2xl p-5 border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-green-500/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex w-3 h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                  <h2 className="font-bold text-foreground">Today's Session</h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {doneToday}/{todayTasks.length} done
                </span>
              </div>
              <Progress value={(doneToday / todayTasks.length) * 100} className="h-2 mb-1" />
              <div className="flex flex-wrap gap-2 mt-3">
                {todayTasks.map((task, idx) => (
                  <span
                    key={task.id}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                      task.completed ? 'border-green-500/40 bg-green-500/10 text-green-600' : 'border-border bg-card'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${subjectColor(task.subject, idx)}`} />
                    <span className="capitalize">{task.subject.replace('_', ' ')}</span>
                    {task.duration && <span className="text-muted-foreground">· {task.duration}</span>}
                  </span>
                ))}
              </div>
            </div>
          ) : nextTask ? (
            <div className="rounded-2xl p-5 border border-border bg-card">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next study session</p>
                    <p className="font-bold text-foreground">{formatLongDate(nextTask.date)}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedDate(nextTask.date)}>
                  View in Calendar
                </Button>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Calendar */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setViewMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                    setSelectedDate(null);
                  }}
                >
                  Today
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-1 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} />;
                const dayTasks = tasksByDate[date] || [];
                const isToday = date === today;
                const isSelected = date === activeDate;
                const allDone = dayTasks.length > 0 && dayTasks.every((t) => t.completed);
                const isPast = date < today;
                const missed = isPast && dayTasks.length > 0 && !allDone;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`relative aspect-square rounded-xl text-sm font-medium transition-all flex flex-col items-center justify-center border-2 ${
                      isSelected
                        ? 'border-primary bg-primary/15 text-primary shadow-sm'
                        : isToday
                        ? 'border-primary/60 bg-primary/5 text-foreground'
                        : 'border-transparent hover:border-primary/40 bg-muted/40'
                    } ${dayTasks.length === 0 && !isToday ? 'text-muted-foreground/40' : 'text-foreground'}`}
                  >
                    <span className="font-semibold">{Number(date.slice(8, 10))}</span>
                    <span className="flex gap-0.5 mt-1">
                      {dayTasks.length > 0 ? (
                        allDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        ) : missed ? (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        ) : (
                          dayTasks.slice(0, 4).map((t, i) => (
                            <span key={t.id} className={`w-1.5 h-1.5 rounded-full ${subjectColor(t.subject, i)}`} />
                          ))
                        )
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                      )}
                    </span>
                    {isToday && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Planned
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Missed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Today
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Day sessions */}
        {activeDate && activeDayPlan && tasksByDate[activeDate] && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground">
                {activeDate === today ? 'Today' : activeDayPlan.dayName} - {activeDayPlan.date}
              </h2>
              <span className="text-xs text-muted-foreground max-w-[50%] truncate">{activeDayPlan.focusArea}</span>
            </div>
            <div className="space-y-3">
              {tasksByDate[activeDate].map((task, idx) => {
                const isCompleted = task.completed;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-4 border-2 transition-all ${
                      isCompleted
                        ? 'border-green-500/40 bg-green-500/5'
                        : task.priority === 'high'
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => void toggleTask(task)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold capitalize text-foreground flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${subjectColor(task.subject, idx)}`} />
                            {task.subject.replace('_', ' ')}
                            {task.priority === 'high' && (
                              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded-full font-bold">PRIORITY</span>
                            )}
                          </span>
                          {task.duration && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                              <Clock className="w-3.5 h-3.5" />
                              {task.duration}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {(task.topics || []).map((topic) => (
                            <span key={topic} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                              {topic}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          🎯 Quiz goal: {task.quiz_goal} questions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-primary to-green-500 text-white"
                            onClick={() => onStartPractice(task.subject)}
                          >
                            <Play className="w-3.5 h-3.5 mr-1" />
                            Practice
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onOpenSyllabus(task.subject)}>
                            <BookMarked className="w-3.5 h-3.5 mr-1" />
                            Syllabus
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onOpenFlashcards(task.subject)}>
                            <Layers className="w-3.5 h-3.5 mr-1" />
                            Flashcards
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reminders */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Study Reminders</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    In-app + browser notifications on your study days. We nudge you if you miss one.
                  </p>
                </div>
              </div>
              {notifState === 'granted' ? (
                <span className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium flex items-center gap-1.5">
                  <BellOff className="w-3.5 h-3.5" />
                  Reminders on
                </span>
              ) : (
                <Button size="sm" onClick={() => void requestPermission()} className="bg-gradient-to-r from-primary to-green-500 text-white">
                  <Bell className="w-3.5 h-3.5 mr-1" />
                  Enable Reminders
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3 pt-1">
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={onGenerateNew}>
            <Sparkles className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, Clock, BookOpen, CheckCircle, Sparkles, ArrowRight, Brain, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useFeatureUsage } from '@/hooks/useFeatureUsage';
import { FeatureLimitReached } from '@/components/FeatureLimitReached';
import { saveLocalPlan, consumePlanFollowup, type PlanFollowup } from '@/lib/studyPlanCache';
import { errorLogger } from '@/services/errorLogger';

interface StudyPlanGeneratorProps {
  userEmail: string;
  subjects: string[];
  targetScore?: number;
  hoursPerDay?: number;
  weakestSubject?: string;
  examDate?: string;
  onBack: () => void;
  onViewCalendar?: () => void;
}

interface DayPlan {
  day: number;
  date: string;
  isoDate: string;
  dayName: string;
  subjects: {
    name: string;
    topics: string[];
    duration: string;
    priority: 'high' | 'medium' | 'low';
    quizGoal: number;
  }[];
  totalHours: number;
  focusArea: string;
}

interface QuizPerformance {
  subject: string;
  accuracy: number;
  totalQuestions: number;
  recentTrend: 'improving' | 'stable' | 'declining';
}

const SUBJECT_TOPICS: Record<string, string[]> = {
  english: ['Comprehension', 'Vocabulary', 'Grammar', 'Idioms & Phrases', 'Sentence Construction', 'Essay Writing', 'Summary', 'Oral English'],
  mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Probability', 'Calculus', 'Indices & Logarithms', 'Sets'],
  physics: ['Mechanics', 'Waves', 'Electricity', 'Magnetism', 'Heat', 'Optics', 'Modern Physics', 'Measurements'],
  chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Electrochemistry', 'Acids & Bases', 'Chemical Bonding'],
  biology: ['Cell Biology', 'Genetics', 'Ecology', 'Plant Biology', 'Animal Biology', 'Reproduction', 'Evolution', 'Health'],
  literature: ['Prose', 'Poetry', 'Drama', 'African Literature', 'Literary Terms', 'Themes & Styles', 'Character Analysis'],
  government: ['Constitution', 'Federalism', 'Democracy', 'Political Parties', 'Nigerian Government', 'International Relations'],
  economics: ['Microeconomics', 'Macroeconomics', 'Trade', 'Money & Banking', 'National Income', 'Economic Development'],
  geography: ['Physical Geography', 'Human Geography', 'Map Reading', 'Climate', 'Population', 'Resources'],
  accounting: ['Financial Statements', 'Double Entry', 'Trial Balance', 'Depreciation', 'Partnership', 'Company Accounts'],
  commerce: ['Trade', 'Banking', 'Insurance', 'Transport', 'Business Organizations', 'Marketing'],
  crs: ['Old Testament', 'New Testament', 'Christian Ethics', 'Church History', 'Parables', 'Epistles'],
  irs: ['Quran Studies', 'Hadith', 'Fiqh', 'Islamic History', 'Tawheed', 'Islamic Ethics', 'Pillars of Islam'],
  agricultural_science: ['Soil Science', 'Crop Production', 'Animal Husbandry', 'Farm Management', 'Pests & Diseases'],
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface AiPlanSubject {
  name: string;
  topics?: string[];
  duration?: string;
  priority?: string;
  quizGoal?: number;
}

interface AiPlanDay {
  day: number;
  focusArea?: string;
  subjects?: AiPlanSubject[];
}

const toLocalIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatDisplayDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });

export const StudyPlanGenerator = ({
  userEmail,
  subjects,
  targetScore = 300,
  hoursPerDay = 4,
  examDate,
  onBack,
  onViewCalendar,
}: StudyPlanGeneratorProps) => {
  const [step, setStep] = useState<'configure' | 'generating' | 'display'>('configure');
  const [progress, setProgress] = useState(0);
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  
  // Follow-up handoff from the calendar: finished vs missed sessions from
  // the previous plan. Consumed once at mount; missed topics lead the plan.
  const [followup] = useState<PlanFollowup | null>(() => consumePlanFollowup());
  // Returning users skip the questionnaire: previous settings carry over.
  const planTargetScore = followup?.config?.targetScore || targetScore;

  // User configuration
  const [selectedDays, setSelectedDays] = useState<string[]>(() =>
    followup?.config?.days?.length
      ? followup.config.days
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() =>
    followup?.config?.subjects?.length ? followup.config.subjects : subjects);
  const [hoursPerSession, setHoursPerSession] = useState(
    followup?.config?.hours || hoursPerDay);
  
  // Quiz performance data
  const [quizPerformance, setQuizPerformance] = useState<QuizPerformance[]>([]);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(true);

  const [showStudyPlanLimitModal, setShowStudyPlanLimitModal] = useState(false);
  const { canUseFeature, incrementUsage } = useFeatureUsage();

  // Load quiz performance data
  useEffect(() => {
    const loadPerformance = async () => {
      setIsLoadingPerformance(true);
      
      const { data: quizData } = await supabase
        .from('quiz_attempts')
        .select('subjects, correct_answers, total_questions, created_at, questions_data')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (quizData && quizData.length > 0) {
        // Calculate per-subject performance
        const subjectStats: Record<string, { correct: number; total: number; recentCorrect: number; recentTotal: number }> = {};
        
        quizData.forEach((attempt, idx) => {
          const isRecent = idx < 5;
          const attemptSubjects = attempt.subjects as string[];
          
          // Try to get detailed question data if available
          if (attempt.questions_data && Array.isArray(attempt.questions_data)) {
            (attempt.questions_data as Array<{ subject: string; userAnswer?: string; correct_answer?: string }>).forEach((q) => {
              const subject = q.subject;
              if (!subjectStats[subject]) {
                subjectStats[subject] = { correct: 0, total: 0, recentCorrect: 0, recentTotal: 0 };
              }
              subjectStats[subject].total++;
              if (isRecent) subjectStats[subject].recentTotal++;
              if ((q.userAnswer || '').toUpperCase() === (q.correct_answer || '').toUpperCase() && !!q.userAnswer) {
                subjectStats[subject].correct++;
                if (isRecent) subjectStats[subject].recentCorrect++;
              }
            });
          } else {
            // Fallback: distribute evenly across subjects
            const scorePerSubject = attempt.correct_answers / attemptSubjects.length;
            const totalPerSubject = attempt.total_questions / attemptSubjects.length;
            
            attemptSubjects.forEach(subject => {
              if (!subjectStats[subject]) {
                subjectStats[subject] = { correct: 0, total: 0, recentCorrect: 0, recentTotal: 0 };
              }
              subjectStats[subject].total += totalPerSubject;
              subjectStats[subject].correct += scorePerSubject;
              if (isRecent) {
                subjectStats[subject].recentTotal += totalPerSubject;
                subjectStats[subject].recentCorrect += scorePerSubject;
              }
            });
          }
        });
        
        // Convert to performance array
        const performance = Object.entries(subjectStats).map(([subject, stats]) => {
          const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
          const recentAccuracy = stats.recentTotal > 0 ? (stats.recentCorrect / stats.recentTotal) * 100 : 0;
          const olderAccuracy = (stats.total - stats.recentTotal) > 0 
            ? ((stats.correct - stats.recentCorrect) / (stats.total - stats.recentTotal)) * 100 
            : accuracy;
          
          let trend: 'improving' | 'stable' | 'declining' = 'stable';
          if (stats.recentTotal > 0 && (stats.total - stats.recentTotal) > 0) {
            if (recentAccuracy > olderAccuracy + 5) trend = 'improving';
            else if (recentAccuracy < olderAccuracy - 5) trend = 'declining';
          }
          
          return {
            subject,
            accuracy: Math.round(accuracy),
            totalQuestions: Math.round(stats.total),
            recentTrend: trend
          };
        }).sort((a, b) => a.accuracy - b.accuracy);
        
        setQuizPerformance(performance);
      }
      
      setIsLoadingPerformance(false);
    };
    
    loadPerformance();
  }, [userEmail]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const generatePlan = async () => {
    if (selectedDays.length === 0 || selectedSubjects.length === 0) {
      // Auto mode with an empty carry-over would spin forever — fall back
      // to the questionnaire instead.
      if (followup?.auto) setStep('configure');
      return;
    }
    
    // Check daily limit for FREE users
    if (!canUseFeature('study_plan_days')) {
      setShowStudyPlanLimitModal(true);
      return;
    }
    const ok = await incrementUsage('study_plan_days');
    if (!ok) {
      setShowStudyPlanLimitModal(true);
      return;
    }
    
    setStep('generating');

    // Build the date skeleton for the selected study days
    const today = new Date();
    const daySlots: { day: number; isoDate: string; dayName: string }[] = [];
    for (let i = 0; i < 14 && daySlots.length < selectedDays.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dayName = DAYS_OF_WEEK[checkDate.getDay()];
      if (selectedDays.includes(dayName)) {
        daySlots.push({
          day: daySlots.length + 1,
          isoDate: toLocalIsoDate(checkDate),
          dayName,
        });
      }
    }

    // Run the progress animation while the AI builds the plan
    const progressPromise = (async () => {
      for (let i = 5; i <= 95; i += 5) {
        await new Promise((r) => setTimeout(r, 100));
        setProgress(i);
      }
    })();

    // Ask the AI for a personalized plan (falls back to local logic if unavailable)
    const { data: aiData } = await supabase.functions.invoke('generate-study-plan', {
      body: {
        subjects: selectedSubjects,
        selectedDays,
        hoursPerSession,
        targetScore: planTargetScore,
        examDate: examDate ?? null,
        quizPerformance,
        daySlots,
        progressSummary: followup
          ? {
              completedSessions: followup.completedSessions,
              totalSessions: followup.totalSessions,
              missedTopics: followup.missed.flatMap((m) =>
                m.topics.slice(0, 6).map((t) => `${m.subject}: ${t}`)
              ).slice(0, 24),
            }
          : null,
      },
    });
    setProgress(100);
    await progressPromise;

    const aiDays: AiPlanDay[] = aiData && !aiData.fallback && Array.isArray(aiData.days)
      ? (aiData.days as AiPlanDay[])
      : [];

    // Sort subjects by weakness (lowest accuracy first)
    const sortedSubjects = [...selectedSubjects].sort((a, b) => {
      const perfA = quizPerformance.find(p => p.subject === a);
      const perfB = quizPerformance.find(p => p.subject === b);
      return (perfA?.accuracy || 50) - (perfB?.accuracy || 50);
    });

    // Identify weak subjects (below 60% or no data)
    const weakSubjects = sortedSubjects.filter(s => {
      const perf = quizPerformance.find(p => p.subject === s);
      return !perf || perf.accuracy < 60;
    });

    // Local fallback: rotate subjects, prioritizing weak ones
    const buildFallbackSubjects = (dayIndex: number): DayPlan['subjects'] => {
      const subjectsForDay: DayPlan['subjects'] = [];
      const hoursPerSubject = hoursPerSession / Math.min(selectedSubjects.length, 3);

      const daySubjects = [...sortedSubjects];
      const prioritySubjects = daySubjects.filter(s => weakSubjects.includes(s)).slice(0, 2);
      const otherSubjects = daySubjects.filter(s => !weakSubjects.includes(s));
      const todaySubjects = [...prioritySubjects, ...otherSubjects].slice(0, 3);

      todaySubjects.forEach((subject, idx) => {
        const perf = quizPerformance.find(p => p.subject === subject);
        const isWeak = weakSubjects.includes(subject);
        const missedForSubject = (followup?.missed.find((m) => m.subject === subject)?.topics || []).slice(0, 3);
        const topics = SUBJECT_TOPICS[subject] || ['General Topics'];

        // Missed topics from the last plan lead; rotation fills the rest.
        const selectedTopics = [...missedForSubject];
        if (selectedTopics.length < 3) {
          const startIdx = (dayIndex * 2) % topics.length;
          for (const t of [...topics.slice(startIdx), ...topics.slice(0, startIdx)]) {
            if (selectedTopics.length >= 3) break;
            if (!selectedTopics.includes(t)) selectedTopics.push(t);
          }
        }

        let quizGoal = 15;
        if (isWeak) quizGoal = 25;
        else if (perf && perf.accuracy >= 80) quizGoal = 10;

        subjectsForDay.push({
          name: subject,
          topics: selectedTopics,
          duration: `${Math.round(hoursPerSubject * (isWeak || missedForSubject.length > 0 ? 1.3 : 1))} hour${hoursPerSubject >= 1 ? 's' : ''}`,
          priority: isWeak || missedForSubject.length > 0 ? 'high' : idx === 0 ? 'medium' : 'low',
          quizGoal
        });
      });

      return subjectsForDay;
    };

    // Merge the AI plan (or fallback) into the date skeleton
    const generatedPlan: DayPlan[] = daySlots.map((slot) => {
      const dayIdx = slot.day - 1;
      const aiDay = aiDays.find(d => d.day === slot.day) || aiDays[dayIdx];

      const subjectsForDay: DayPlan['subjects'] = aiDay?.subjects && aiDay.subjects.length > 0
        ? aiDay.subjects
            .filter(s => s && typeof s.name === 'string' && selectedSubjects.includes(s.name))
            .slice(0, 3)
            .map(s => ({
              name: s.name,
              topics: s.topics && s.topics.length > 0
                ? s.topics
                : (SUBJECT_TOPICS[s.name] || ['General Topics']).slice(0, 3),
              duration: typeof s.duration === 'string' && s.duration ? s.duration : '1 hour',
              priority: s.priority === 'high' || s.priority === 'low' ? s.priority : 'medium',
              quizGoal: typeof s.quizGoal === 'number' && s.quizGoal > 0 ? s.quizGoal : 15
            }))
        : buildFallbackSubjects(dayIdx);

      const weakestToday = subjectsForDay.find(s => s.priority === 'high');
      const focusArea = aiDay?.focusArea && typeof aiDay.focusArea === 'string'
        ? aiDay.focusArea
        : weakestToday
          ? `Focus on ${weakestToday.name.replace('_', ' ')} improvement`
          : 'Balanced practice day';

      return {
        day: slot.day,
        date: formatDisplayDate(slot.isoDate),
        isoDate: slot.isoDate,
        dayName: slot.dayName,
        subjects: subjectsForDay,
        totalHours: hoursPerSession,
        focusArea
      };
    });

    setPlan(generatedPlan);
    setStep('display');
    // Cache locally first so the calendar works even if the DB save fails
    // (offline, RLS, inactive project). DB remains source of truth.
    saveLocalPlan(userEmail, generatedPlan, planTargetScore, hoursPerSession);
    void savePlanToDb(generatedPlan);
  };

  // Returning users skip the questionnaire: build straight from the handoff.
  // Guarded so re-renders (or dev double-effects) can't spend usage twice.
  // Waits for quiz performance first — building on mount would bake in an
  // empty weak-subject sort and an empty AI prompt section.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (followup?.auto && !isLoadingPerformance && !autoStartedRef.current) {
      autoStartedRef.current = true;
      void generatePlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followup, isLoadingPerformance]);

  // Persist the plan so users can follow it (calendar + task tracking).
  // Order matters: insert plan + tasks first, archive the old plan only on
  // success. Otherwise a tasks failure (e.g. duplicate subject in one AI
  // day violating the unique constraint) leaves an empty active plan while
  // the good old one is already archived.
  const savePlanToDb = async (planToSave: DayPlan[]) => {
    if (!userEmail) return;
    setIsSaving(true);
    setSaveError(false);
    try {
      const { data: planRow, error: planError } = await supabase
        .from('study_plans')
        .insert({
          email: userEmail,
          plan_data: planToSave as unknown as Database['public']['Tables']['study_plans']['Insert']['plan_data'],
          target_score: planTargetScore,
          hours_per_day: hoursPerSession,
        })
        .select('id')
        .single();

      if (planError || !planRow) {
        setSaveError(true);
        return;
      }

      const seen = new Set<string>();
      const tasks = planToSave.flatMap((day) =>
        day.subjects
          .filter((subject) => {
            // AI plans occasionally repeat a subject within one day; the
            // tasks table enforces one row per (plan, day, subject).
            const key = `${day.day}|${subject.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((subject) => ({
            plan_id: planRow.id,
            day: day.day,
            date: day.isoDate,
            day_name: day.dayName,
            subject: subject.name,
            topics: subject.topics,
            duration: subject.duration,
            priority: subject.priority,
            quiz_goal: subject.quizGoal,
          }))
      );

      const { error: tasksError } = await supabase
        .from('study_plan_tasks')
        .insert(tasks);

      if (tasksError) {
        // Roll back the orphan plan so the previous active plan survives.
        await supabase.from('study_plans').delete().eq('id', planRow.id);
        setSaveError(true);
        return;
      }

      // Archive any previous active plan (excluding the new one).
      await supabase
        .from('study_plans')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('email', userEmail)
        .eq('status', 'active')
        .neq('id', planRow.id);

      setSavedPlanId(planRow.id);
    } catch (error) {
      errorLogger.error(error, { component: 'StudyPlanGenerator', action: 'save study plan' });
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const content = `
JAMB PERSONALIZED STUDY PLAN
Generated for: ${userEmail}
Target Score: ${planTargetScore}+
Generated: ${new Date().toLocaleDateString('en-NG')}

═══════════════════════════════════════════════════════

📊 YOUR PERFORMANCE ANALYSIS:
${quizPerformance.map(p => `
${p.subject.toUpperCase()}: ${p.accuracy}% accuracy (${p.recentTrend === 'improving' ? '📈 Improving' : p.recentTrend === 'declining' ? '📉 Needs Attention' : '➡️ Stable'})
`).join('')}

WEAK AREAS TO FOCUS ON:
${quizPerformance.filter(p => p.accuracy < 60).map(p => `- ${p.subject}`).join('\n') || '- All subjects performing well!'}

═══════════════════════════════════════════════════════

${plan.map(day => `
📅 ${day.dayName.toUpperCase()} - ${day.date}
Focus: ${day.focusArea}
Total Study Time: ${day.totalHours} hours

${day.subjects.map(s => `
📚 ${s.name.toUpperCase()} (${s.duration})
   Priority: ${s.priority.toUpperCase()}
   Topics: ${s.topics.join(', ')}
   Quiz Goal: ${s.quizGoal} questions
`).join('')}

───────────────────────────────────────────────────────
`).join('')}

═══════════════════════════════════════════════════════

💡 AI-POWERED RECOMMENDATIONS:
${quizPerformance.filter(p => p.accuracy < 60).length > 0 ? `
• Focus 40% of your study time on weak subjects
• Complete at least 20 questions daily in weak areas
• Review explanations for every wrong answer
` : `
• Maintain your current study habits
• Challenge yourself with harder questions
• Practice time management for exam conditions
`}

🎯 You've got this, future uni star! That ${planTargetScore}+ is yours! 💪
      `.trim();

      const filename = `JAMB_AI_Study_Plan_${new Date().toISOString().split('T')[0]}.txt`;
      
      // Check if we're on mobile or if regular download might fail
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Mobile-friendly approach: open in new window for copy/save
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${filename}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: monospace; 
                    padding: 20px; 
                    white-space: pre-wrap; 
                    word-wrap: break-word;
                    background: #1a1a2e;
                    color: #eee;
                    line-height: 1.5;
                  }
                  .actions {
                    position: sticky;
                    top: 0;
                    background: #16213e;
                    padding: 15px;
                    margin: -20px -20px 20px -20px;
                    text-align: center;
                    border-bottom: 1px solid #0f3460;
                  }
                  button {
                    background: #e94560;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 5px;
                  }
                  button:active { opacity: 0.8; }
                </style>
              </head>
              <body>
                <div class="actions">
                  <p style="margin: 0 0 10px 0; color: #94a3b8;">📋 Long press to select all, or use the button below</p>
                  <button onclick="
                    const textArea = document.createElement('textarea');
                    textArea.value = document.getElementById('content').innerText;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    this.innerText = '✓ Copied!';
                    setTimeout(() => this.innerText = 'Copy to Clipboard', 2000);
                  ">Copy to Clipboard</button>
                </div>
                <pre id="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard?.writeText(content).then(() => {
            alert('Study plan copied to clipboard! Paste it in Notes or any text app to save.');
          }).catch(() => {
            alert('Could not download. Please take a screenshot of your study plan.');
          });
        }
      } else {
        // Desktop: standard download approach
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        // Clean up after a delay to ensure download starts
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
    } catch (error) {
      errorLogger.error(error, { component: 'StudyPlanGenerator', action: 'download plan' });
      // Ultimate fallback
      alert('Download failed. Please take a screenshot of your study plan instead.');
    }
  };

  // Configuration Step
  if (step === 'configure') {
    return (
      <>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              AI-Powered Study Plan 🧠
            </h1>
            <p className="text-muted-foreground">
              Personalized based on your quiz performance
            </p>
          </motion.div>

          {/* Follow-up banner: continuing from the last plan */}
          {followup && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="pt-4 text-sm">
                  <p className="font-semibold text-foreground mb-1">
                    Continuing your last plan — {followup.completedSessions}/{followup.totalSessions} sessions done 🎯
                  </p>
                  <p className="text-muted-foreground">
                    {followup.missed.length > 0
                      ? `Missed topics (${followup.missed.reduce((n, m) => n + m.topics.length, 0)}) go first with high priority. Finished topics step back.`
                      : 'Clean slate with momentum — weak quiz areas still lead.'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Performance Summary */}
          {!isLoadingPerformance && quizPerformance.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Your Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {quizPerformance.slice(0, 4).map(perf => (
                      <div 
                        key={perf.subject}
                        className={`p-2 rounded-lg text-sm ${
                          perf.accuracy < 50 ? 'bg-red-500/10 border border-red-500/30' :
                          perf.accuracy < 70 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                          'bg-green-500/10 border border-green-500/30'
                        }`}
                      >
                        <p className="capitalize font-medium text-foreground">{perf.subject.replace('_', ' ')}</p>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            perf.accuracy < 50 ? 'text-red-500' :
                            perf.accuracy < 70 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>{perf.accuracy}%</span>
                          <span className="text-xs text-muted-foreground">
                            {perf.recentTrend === 'improving' ? '📈' : perf.recentTrend === 'declining' ? '📉' : '➡️'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {quizPerformance.filter(p => p.accuracy < 60).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ⚠️ AI will prioritize: {quizPerformance.filter(p => p.accuracy < 60).map(p => p.subject).join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isLoadingPerformance && (
            <div className="text-center py-4 text-muted-foreground">
              Loading your quiz history...
            </div>
          )}

          {/* Day Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Which days can you study?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDays.includes(day)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedDays.length} days selected
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subject Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Which subjects to include?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map(subject => {
                    const perf = quizPerformance.find(p => p.subject === subject);
                    const isWeak = perf && perf.accuracy < 60;
                    
                    return (
                      <label
                        key={subject}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          selectedSubjects.includes(subject)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Checkbox
                          checked={selectedSubjects.includes(subject)}
                          onCheckedChange={() => toggleSubject(subject)}
                        />
                        <span className="capitalize text-sm flex-1">{subject.replace('_', ' ')}</span>
                        {isWeak && <span className="text-xs text-red-500">⚠️</span>}
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hours per Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Hours per study session?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map(hours => (
                    <button
                      key={hours}
                      onClick={() => setHoursPerSession(hours)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        hoursPerSession === hours
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3"
          >
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button
              onClick={generatePlan}
              disabled={selectedDays.length === 0 || selectedSubjects.length === 0}
              className="flex-1 bg-gradient-to-r from-primary to-green-500"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Plan
            </Button>
          </motion.div>
        </div>
      </div>
      {showStudyPlanLimitModal && (
        <FeatureLimitReached
          featureType="study_plan_days"
          onBonusEarned={() => setShowStudyPlanLimitModal(false)}
        />
      )}
    </>
    );
  }

  // Generating Step
  if (step === 'generating') {
    return (
      <>
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-3xl p-8 border border-border shadow-2xl text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-green-500 mx-auto mb-6 flex items-center justify-center"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            AI is Building Your Plan ✨
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Analyzing your quiz history and optimizing your study schedule...
          </p>
          
          <Progress value={progress} className="h-3 mb-4" />
          <p className="text-sm text-primary font-medium">{progress}% complete</p>
          
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            {progress >= 20 && <p>✓ Analyzing quiz performance...</p>}
            {progress >= 40 && <p>✓ Identifying weak areas...</p>}
            {progress >= 60 && <p>✓ Prioritizing topics...</p>}
            {progress >= 80 && <p>✓ Creating personalized schedule...</p>}
            {progress >= 100 && <p>✓ Finalizing your plan!</p>}
          </div>
        </motion.div>
      </div>
      {showStudyPlanLimitModal && (
        <FeatureLimitReached
          featureType="study_plan_days"
          onBonusEarned={() => setShowStudyPlanLimitModal(false)}
        />
      )}
    </>
    );
  }

  // Display Step
  return (
    <>
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Your AI Study Plan is Ready! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">
            Personalized for your learning patterns
          </p>
        </motion.div>

        {/* Save status + Follow / Download */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {savedPlanId && !saveError ? (
            <div className="mb-4 flex items-center justify-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Plan saved! You can now follow it in your study calendar.</span>
            </div>
          ) : saveError ? (
            <div className="mb-4 flex items-center justify-center gap-2 text-red-500 text-sm">
              <span>Plan couldn't be saved.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void savePlanToDb(plan)}
                disabled={isSaving}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <span>{isSaving ? 'Saving your plan...' : 'Saving your plan for calendar tracking...'}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {onViewCalendar && (
              <Button
                onClick={onViewCalendar}
                size="lg"
                className="bg-gradient-to-r from-primary to-green-500 hover:opacity-90 text-white px-8 py-6 text-lg rounded-2xl shadow-lg"
              >
                <Calendar className="w-6 h-6 mr-2" />
                Follow Plan & Open Calendar
              </Button>
            )}
            <Button
              onClick={handleDownloadPDF}
              size="lg"
              variant={savedPlanId && !saveError ? 'outline' : 'default'}
              className={`${
                savedPlanId && !saveError
                  ? ''
                  : 'bg-gradient-to-r from-primary to-green-500 hover:opacity-90 text-white'
              } px-8 py-6 text-lg rounded-2xl shadow-lg`}
            >
              <Download className="w-6 h-6 mr-2" />
              Download Study Plan
            </Button>
          </div>
        </motion.div>

        {/* Plan Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <Card className="bg-primary/10 border-primary/30 text-center">
            <CardContent className="p-4">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{plan.length}</p>
              <p className="text-sm text-muted-foreground">Study Days</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30 text-center">
            <CardContent className="p-4">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{plan.reduce((sum, d) => sum + d.totalHours, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/30 text-center">
            <CardContent className="p-4">
              <Target className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{planTargetScore}+</p>
              <p className="text-sm text-muted-foreground">Target Score</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Day Tabs */}
        <div className="flex gap-2 mb-6 justify-center overflow-x-auto pb-2">
          {plan.map((day, idx) => (
            <Button
              key={day.day}
              variant={currentDay === idx ? "default" : "outline"}
              onClick={() => setCurrentDay(idx)}
              className={`rounded-full ${currentDay === idx ? 'bg-primary' : ''}`}
            >
              {day.dayName.slice(0, 3)}
            </Button>
          ))}
        </div>

        {/* Current Day Plan */}
        {plan[currentDay] && (
          <motion.div
            key={currentDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="mb-6 border-2 border-primary/30">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-green-500/10">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {plan[currentDay].dayName} - {plan[currentDay].date}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {plan[currentDay].focusArea}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {plan[currentDay].subjects.map((subject, idx) => {
                    const perf = quizPerformance.find(p => p.subject === subject.name);
                    
                    return (
                      <motion.div
                        key={subject.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-xl border-2 ${
                          subject.priority === 'high' 
                            ? 'border-red-500/50 bg-red-500/5' 
                            : subject.priority === 'medium'
                            ? 'border-yellow-500/50 bg-yellow-500/5'
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className={`w-5 h-5 ${
                              subject.priority === 'high' ? 'text-red-500' : 'text-primary'
                            }`} />
                            <span className="font-bold capitalize text-foreground">
                              {subject.name.replace('_', ' ')}
                            </span>
                            {subject.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                PRIORITY
                              </span>
                            )}
                            {perf && (
                              <span className={`text-xs ${
                                perf.accuracy < 60 ? 'text-red-500' : 'text-green-500'
                              }`}>
                                ({perf.accuracy}%)
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {subject.duration}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {subject.topics.map((topic) => (
                            <span
                              key={topic}
                              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          🎯 Quiz Goal: {subject.quizGoal} questions
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Daily Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/20 to-green-500/20 rounded-xl border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">Daily Total</p>
                      <p className="text-sm text-muted-foreground">
                        {plan[currentDay].subjects.reduce((sum, s) => sum + s.quizGoal, 0)} practice questions
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {plan[currentDay].totalHours}h
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Study Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl p-6 border border-border mb-8"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            💡 AI Recommendations Based on Your Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quizPerformance.filter(p => p.accuracy < 60).length > 0 ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4 text-red-500" />
                  Focus more on {quizPerformance.filter(p => p.accuracy < 60).map(p => p.subject).join(', ')}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Complete 20+ questions daily in weak areas
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4 text-green-500" />
                  Great performance! Focus on maintaining consistency
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Challenge yourself with timed exam simulations
                </div>
              </>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowRight className="w-4 h-4 text-primary" />
              Review explanations for every wrong answer
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowRight className="w-4 h-4 text-primary" />
              Take 10-min breaks every hour
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack} size="lg">
            Back to Dashboard
          </Button>
        </div>

        {/* Motivational Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-lg text-muted-foreground mt-8 italic"
        >
          You've got this, future uni star! That {planTargetScore}+ is yours! 💪🎯
        </motion.p>
      </div>
    </div>
    {showStudyPlanLimitModal && (
      <FeatureLimitReached
        featureType="study_plan_days"
        onBonusEarned={() => setShowStudyPlanLimitModal(false)}
      />
      )}
  </>
  );
};

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Flag, FlagOff, ChevronLeft, ChevronRight, Play, CheckCircle2, XCircle, Trophy, RotateCcw, BookOpen, AlertTriangle, Loader2, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { buildMockSections, gradeMock, scoreBand, type MockQuestion, type MockSection, type MockResults } from '@/lib/mockExam';
import { ReportQuestionButton } from '@/components/ReportQuestionButton';
import { stripQuestionHtml } from '@/lib/sanitize';
import { downloadScorecard, shareScorecard, type ScorecardData } from '@/lib/scorecard';
import { pickAdaptive, collectWeakQuestionCounts } from '@/lib/adaptive';
import { getQuestions, saveQuestions } from '@/services/offlineStorage';

interface MockExamProps {
  userEmail: string;
  subjects: string[];
  onExit: () => void;
}

type Phase = 'setup' | 'exam' | 'results';

const ALL_SUBJECTS: Database['public']['Enums']['jamb_subject'][] = [
  'mathematics', 'physics', 'chemistry', 'biology', 'literature', 'government',
  'economics', 'crs', 'irs', 'geography', 'accounting', 'commerce', 'agricultural_science',
];

const formatTime = (totalSec: number): string => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const MockExam = ({ userEmail, subjects, onExit }: MockExamProps) => {
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() =>
    subjects.filter((s) => s !== 'english').slice(0, 3),
  );
  const [sections, setSections] = useState<MockSection[]>([]);
  const [sectionQuestions, setSectionQuestions] = useState<MockQuestion[][]>([]);
  const [sectionAnswers, setSectionAnswers] = useState<Record<string, Record<string, string>>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const [sectionTimes, setSectionTimes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MockResults | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const endTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const sectionStartRef = useRef<number>(Date.now());
  // The countdown interval always calls through this ref so timeout
  // auto-submit grades the LATEST answers, not the ones captured when the
  // section started (stale closure would silently zero the score).
  const submitExamRef = useRef<() => void>(() => {});
  const submittingRef = useRef(false);

  const currentSection = sections[currentSectionIdx];
  const currentQuestions = useMemo(() => sectionQuestions[currentSectionIdx] || [], [sectionQuestions, currentSectionIdx]);
  const currentAnswers = currentSection ? sectionAnswers[currentSection.key] || {} : {};
  const answeredCount = currentQuestions.filter((q) => currentAnswers[q.id]).length;

  const toggleSubject = useCallback((subject: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) return prev.filter((s) => s !== subject);
      if (prev.length >= 3) {
        toast.error('Pick up to 3 subjects (English is automatic)');
        return prev;
      }
      return [...prev, subject];
    });
  }, []);

  const startExam = useCallback(async () => {
    if (selectedSubjects.length === 0) {
      toast.error('Pick at least one subject');
      return;
    }
    setLoading(true);
    try {
      const builtSections = buildMockSections(selectedSubjects);
      const isOnline = typeof navigator === 'undefined' || navigator.onLine;

      // Adaptive difficulty: learn which questions the user has missed before
      let weakCounts: Map<string, number> = new Map();
      if (isOnline) {
        const { data: pastAttempts } = await supabase
          .from('quiz_attempts')
          .select('questions_data')
          .eq('email', userEmail)
          .order('created_at', { ascending: false })
          .limit(10);
        if (pastAttempts) {
          weakCounts = collectWeakQuestionCounts(pastAttempts.map(a => a.questions_data));
        }
      }

      const loaded: MockQuestion[][] = [];
      for (const section of builtSections) {
        let pool: MockQuestion[] = [];
        if (isOnline) {
          const { data, error } = await supabase
            .from('jamb_questions')
            .select('id, question, option_a, option_b, option_c, option_d, correct_answer, subject, year, explanation, image_url, is_ai_generated')
            .eq('subject', section.subject as Database['public']['Enums']['jamb_subject'])
            .limit(200);
          if (error) throw error;
          pool = (data || []) as MockQuestion[];
          // Refresh the offline cache while online
          if (pool.length > 0) {
            try {
              await saveQuestions(pool as unknown as Parameters<typeof saveQuestions>[0]);
            } catch {
              // cache is best-effort
            }
          }
        }
        if (pool.length === 0) {
          const cached = await getQuestions([section.subject]);
          pool = cached as unknown as MockQuestion[];
          if (!isOnline && pool.length > 0) {
            toast('Offline Mode', { description: `Using cached ${section.title} questions` });
          }
        }
        if (pool.length < section.questionCount) {
          toast.error(`Not enough ${section.title} questions in the bank (${pool.length}/${section.questionCount}). Try again later.`);
          setLoading(false);
          return;
        }
        loaded.push(pickAdaptive(pool, weakCounts, section.questionCount));
      }
      setSections(builtSections);
      setSectionQuestions(loaded);
      setSectionAnswers({});
      setFlagged(new Set());
      setCurrentSectionIdx(0);
      setCurrentQIdx(0);
      setSectionTimes({});
      endTimeRef.current = Date.now() + builtSections[0].minutes * 60 * 1000;
      sectionStartRef.current = Date.now();
      startTimeRef.current = Date.now();
      setRemainingSec(builtSections[0].minutes * 60);
      setPhase('exam');
    } catch {
      toast.error('Failed to load mock questions. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [selectedSubjects, userEmail]);

  // Countdown tick
  useEffect(() => {
    if (phase !== 'exam') return;
    const interval = setInterval(() => {
      const remain = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setRemainingSec(remain);
      if (remain <= 0) {
        // Auto-submit section when time runs out
        const idx = currentSectionIdx;
        setSectionTimes((prev) => ({ ...prev, [sections[idx]?.key]: sections[idx]?.minutes * 60 || 0 }));
        advanceSection(idx);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentSectionIdx, sections]);

  const advanceSection = useCallback(
    (fromIdx: number) => {
      if (fromIdx + 1 < sections.length) {
        setCurrentSectionIdx(fromIdx + 1);
        setCurrentQIdx(0);
        endTimeRef.current = Date.now() + sections[fromIdx + 1].minutes * 60 * 1000;
        sectionStartRef.current = Date.now();
      } else {
        // Last section timed out — grade with the latest answers via ref.
        submitExamRef.current();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sections],
  );

  const answerQuestion = useCallback((questionId: string, option: string) => {
    setSectionAnswers((prev) => {
      const sectionKey = sections[currentSectionIdx]?.key;
      if (!sectionKey) return prev;
      return { ...prev, [sectionKey]: { ...prev[sectionKey], [questionId]: option } };
    });
  }, [sections, currentSectionIdx]);

  const toggleFlag = useCallback(() => {
    const q = currentQuestions[currentQIdx];
    if (!q) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id);
      else next.add(q.id);
      return next;
    });
  }, [currentQuestions, currentQIdx]);

  const goNext = useCallback(() => {
    if (currentQIdx < currentQuestions.length - 1) setCurrentQIdx(currentQIdx + 1);
  }, [currentQIdx, currentQuestions.length]);

  const goPrev = useCallback(() => {
    if (currentQIdx > 0) setCurrentQIdx(currentQIdx - 1);
  }, [currentQIdx]);

  const submitExam = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const finalTimes: Record<string, number> = { ...sectionTimes };
      sections.forEach((s) => {
        if (!finalTimes[s.key]) finalTimes[s.key] = Math.round((Date.now() - sectionStartRef.current) / 1000);
      });
      const graded = gradeMock(sections, sectionQuestions, sectionAnswers, finalTimes);
      setResults(graded);
      setPhase('results');

      const questionsData = sections.flatMap((section, idx) =>
        (sectionQuestions[idx] || []).map((q) => ({ ...q, userAnswer: sectionAnswers[section.key]?.[q.id] || '' })),
      );

      // Offline mocks can't sync (no queue type for full mocks) — results
      // still show; the attempt just isn't recorded.
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        toast.info('Offline — mock results shown but not saved');
        return;
      }

      await supabase.from('mock_attempts').insert({
        email: userEmail,
        mock_name: 'UTME Mock',
        total_score: graded.totalScore,
        max_score: 400,
        english_score: graded.sections.find((s) => s.key === 'english')?.score || 0,
        english_total: 60,
        section_scores: graded.sections.reduce<Record<string, number>>((acc, s) => {
          acc[s.key] = s.score;
          return acc;
        }, {}),
        questions_data: questionsData as unknown as Database['public']['Tables']['mock_attempts']['Row']['questions_data'],
        time_taken_seconds: graded.timeTakenSec,
      });
    } catch {
      toast.error('Could not save your mock attempt, but here are your results!');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [sectionTimes, sections, sectionQuestions, sectionAnswers, userEmail]);

  // Keep the ref pointing at the latest submit so the countdown interval
  // below never grades stale answers.
  submitExamRef.current = submitExam;

  const currentQuestion = currentQuestions[currentQIdx];
  const band = results ? scoreBand(results.totalScore) : null;

  const buildScorecardData = (): ScorecardData => ({
    userName: userEmail.split('@')[0],
    title: 'UTME MOCK RESULT',
    score: results?.totalScore ?? 0,
    maxScore: results?.maxScore ?? 400,
    bandLabel: band?.label ?? '',
    sections: (results?.sections ?? []).map((s) => ({ name: s.title, score: s.score, correct: s.correct, total: s.total })),
  });

  const handleShareScorecard = async () => {
    if (!results) return;
    setSharing(true);
    const text = `I scored ${results.totalScore}/400 on my UTME Mock with Jamb Crash AI! ${band?.label ?? ''}`;
    try {
      await shareScorecard(buildScorecardData(), text);
      toast.success('Scorecard shared!');
    } catch {
      toast.error('Could not share scorecard');
    } finally {
      setSharing(false);
    }
  };

  // ============ SETUP ============
  if (phase === 'setup') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">UTME CBT Mock</h1>
              <p className="text-sm text-muted-foreground">Full exam simulation · 180 questions · JAMB 400-mark grading</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xl font-bold text-foreground">180</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xl font-bold text-foreground">~3 hrs</p>
              <p className="text-xs text-muted-foreground">Real CBT timing</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xl font-bold text-primary">/400</p>
              <p className="text-xs text-muted-foreground">Official grading</p>
            </div>
          </div>

          <h2 className="font-bold text-foreground mb-2">Pick your 3 subjects</h2>
          <p className="text-xs text-muted-foreground mb-4">Use of English (60 Qs) is automatic. Each subject adds 40 questions.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {ALL_SUBJECTS.map((subject) => {
              const active = selectedSubjects.includes(subject);
              return (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {subject.replace('_', ' ')}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-muted/50 p-4 mb-6">
            <p className="font-bold text-foreground text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Exam rules
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li>English (60 mins) comes first, then each subject (50 mins) — sections lock like the real CBT</li>
              <li>You can flag questions and jump around within the current section</li>
              <li>When a section's time ends, it submits automatically</li>
              <li>Score = Use of English + your best 3 subjects, out of 400</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onExit} className="flex-1">Back</Button>
            <Button onClick={startExam} disabled={loading || selectedSubjects.length === 0} className="flex-1 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Loading questions...' : 'Start Mock'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============ RESULTS ============
  if (phase === 'results' && results && band) {
    const englishResult = results.sections.find((s) => s.key === 'english');
    const subjectResults = results.sections.filter((s) => s.key !== 'english');
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-3">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">
              {results.totalScore}<span className="text-lg text-muted-foreground font-semibold">/400</span>
            </h1>
            <p className={`font-bold ${band.color}`}>{band.label}</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{band.advice}</p>
          </div>

          <div className="space-y-3 mb-6">
            {englishResult && (
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-foreground">{englishResult.title}</span>
                  <Badge variant="secondary">{englishResult.correct}/{englishResult.total} · {englishResult.score}</Badge>
                </div>
                <Progress value={englishResult.score} className="h-2" />
              </div>
            )}
            {subjectResults.map((s) => (
              <div key={s.key} className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-foreground capitalize">{s.title}</span>
                  <Badge variant="secondary">{s.correct}/{s.total} · {s.score}</Badge>
                </div>
                <Progress value={s.score} className="h-2" />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mb-4">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleShareScorecard} disabled={sharing}>
              {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              Share Scorecard
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={() => downloadScorecard(buildScorecardData())}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          {/* Review */}
          <details className="mb-6 rounded-xl border overflow-hidden">
            <summary className="cursor-pointer px-4 py-3 font-bold text-sm text-foreground bg-muted/30">
              Review your answers
            </summary>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {results.sections.map((section, idx) => (
                <div key={section.key}>
                  <h3 className="font-bold text-foreground text-sm mb-2 capitalize">{section.title}</h3>
                  <div className="space-y-2">
                    {((sectionQuestions[idx] || []) as MockQuestion[]).map((q, qi) => {
                      const userAnswer = sectionAnswers[section.key]?.[q.id] || '';
                      const correct = (userAnswer || '').toUpperCase() === (q.correct_answer || '').toUpperCase();
                      return (
                        <div key={q.id} className={`rounded-lg border p-3 text-sm ${correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/40'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              {correct ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                              <div>
                                <p className="font-medium text-foreground">{qi + 1}. {stripQuestionHtml(q.question)}</p>
                                {q.is_ai_generated && (
                                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-500">AI Practice</span>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Your answer: <span className={correct ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{userAnswer ? `Option ${userAnswer.toUpperCase()}` : 'Not answered'}</span>
                                  {!correct && <> · Correct: <span className="text-emerald-600 font-medium">Option {q.correct_answer.toUpperCase()}</span></>}
                                </p>
                                {q.explanation && <p className="text-xs text-muted-foreground mt-1">{stripQuestionHtml(q.explanation)}</p>}
                              </div>
                            </div>
                            <ReportQuestionButton questionId={q.id} userEmail={userEmail} compact />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </details>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onExit} className="flex-1">Done</Button>
            <Button onClick={() => setPhase('setup')} className="flex-1 gap-2">
              <RotateCcw className="w-4 h-4" /> Retake Mock
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============ EXAM ============
  if (!currentSection) return null;

  const totalInSection = currentQuestions.length;
  const progressPct = totalInSection > 0 ? Math.round((answeredCount / totalInSection) * 100) : 0;
  const lowTime = remainingSec <= 300;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-foreground">{currentSection.title}</h2>
            <p className="text-xs text-muted-foreground">
              Section {currentSectionIdx + 1} of {sections.length} · {answeredCount}/{totalInSection} answered
            </p>
          </div>
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 font-mono font-bold ${lowTime ? 'bg-red-50 text-red-600' : 'bg-muted/50 text-foreground'}`}>
            <Timer className="w-4 h-4" /> {formatTime(remainingSec)}
          </div>
        </div>

        <div className="px-4 pt-3">
          <Progress value={progressPct} className="h-1.5" />
        </div>

        {/* Question */}
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
            >
              {currentQuestion && (
                <>
                  {currentQuestion.image_url && (
                    <img src={currentQuestion.image_url} alt="Question diagram" className="rounded-xl border max-h-56 mb-4" />
                  )}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      {currentQuestion.is_ai_generated && (
                        <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/30 mb-2">AI Practice</Badge>
                      )}
                      <p className="font-semibold text-foreground text-base leading-relaxed">
                        {currentQIdx + 1}. {stripQuestionHtml(currentQuestion.question)}
                      </p>
                    </div>
                    <ReportQuestionButton questionId={currentQuestion.id} userEmail={userEmail} compact />
                  </div>
                  <div className="space-y-2">
                    {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                      const optionKey = `option_${opt}` as const;
                      const selected = currentAnswers[currentQuestion.id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => answerQuestion(currentQuestion.id, opt)}
                          className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                            selected ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/40'
                          }`}
                        >
                          <span className="inline-block w-6 font-bold uppercase">{opt}.</span> {stripQuestionHtml(currentQuestion[optionKey])}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div className="border-t p-4 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={goPrev} disabled={currentQIdx === 0}>
            <ChevronLeft className="w-4 h-4" /> Prev
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFlag} className={flagged.has(currentQuestion?.id || '') ? 'text-yellow-500' : ''}>
            {flagged.has(currentQuestion?.id || '') ? <Flag className="w-4 h-4" /> : <FlagOff className="w-4 h-4" />}
            {flagged.has(currentQuestion?.id || '') ? 'Flagged' : 'Flag'}
          </Button>
          <Button size="sm" onClick={goNext} disabled={currentQIdx >= totalInSection - 1}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Palette */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase">Question palette</p>
            {currentSectionIdx < sections.length - 1 ? (
              <p className="text-[10px] text-muted-foreground">Finish or run out of time to unlock next section</p>
            ) : (
              <p className="text-[10px] text-muted-foreground">Last section</p>
            )}
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {currentQuestions.map((q, i) => {
              const answered = !!currentAnswers[q.id];
              const isFlagged = flagged.has(q.id);
              const isCurrent = i === currentQIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIdx(i)}
                  className={`h-8 rounded-lg text-xs font-bold transition-colors ${
                    isCurrent ? 'ring-2 ring-primary' : ''
                  } ${
                    answered ? 'bg-primary text-primary-foreground' : isFlagged ? 'bg-yellow-400 text-yellow-950' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center mt-4">
            <Button variant="destructive" size="sm" onClick={submitExam} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Submit Mock
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Search, Clock, Loader2, CheckCircle2,
  PlayCircle, AlertTriangle, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { InteractiveLesson } from '@/components/InteractiveLesson';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { errorLogger } from '@/services/errorLogger';
import type { Lesson, MasteryLevel } from '@/types/lesson';

/** Lightweight row for the list. Full content is fetched on open. */
interface LessonSummary {
  id: string;
  subject: string;
  topic: string;
  subtopic: string;
  title: string;
  difficulty_level: string;
  estimated_minutes: number;
}

const SUBJECT_LABELS: Record<string, string> = {
  english: 'English',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  literature: 'Literature',
  government: 'Government',
  economics: 'Economics',
  commerce: 'Commerce',
  accounting: 'Accounting',
  crs: 'CRS',
  irs: 'IRS',
  agricultural_science: 'Agric Science',
  geography: 'Geography',
  history: 'History',
};

const subjectLabel = (subject: string) =>
  SUBJECT_LABELS[subject] ?? subject.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  easy: 'bg-green-500/15 text-green-700 dark:text-green-400',
  medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  hard: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

const MASTERY_STYLES: Record<MasteryLevel, string> = {
  not_started: '',
  learning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  reviewing: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  mastered: 'bg-green-500/15 text-green-700 dark:text-green-400',
};

interface LessonLibraryProps {
  userEmail: string;
  subjects: string[];
  onBack: () => void;
  /** Deep-link straight into a lesson, e.g. from a syllabus topic. */
  initialLessonId?: string | null;
  /** Deep-link by subject (+ optional topic): filters the library and
   * opens the best-matching lesson. Used by study-plan + mastery links. */
  initialSubject?: string | null;
  initialTopic?: string | null;
}

/**
 * Browses the `lessons` table directly.
 *
 * This deliberately does not join to `jamb_syllabus`. The two tables use
 * different topic taxonomies, so a topic-string join hid most lessons; listing
 * lessons on their own makes every published lesson reachable regardless of
 * whether a matching syllabus row exists.
 */
export function LessonLibrary({
  userEmail,
  subjects,
  onBack,
  initialLessonId,
  initialSubject,
  initialTopic,
}: LessonLibraryProps) {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [openLesson, setOpenLesson] = useState<Lesson | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [masteryByLesson, setMasteryByLesson] = useState<Record<string, MasteryLevel>>({});

  const wantedSubjects = useMemo(
    () => subjects.map((s) => s.toLowerCase()),
    [subjects]
  );

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Summary columns only — the full corpus is ~750 KB of JSONB.
      let queryBuilder = supabase
        .from('lessons')
        .select('id,subject,topic,subtopic,title,difficulty_level,estimated_minutes')
        .eq('status', 'published');

      if (wantedSubjects.length > 0) {
        queryBuilder = queryBuilder.in('subject', wantedSubjects);
      }

      const { data, error } = await queryBuilder.order('subject').order('topic');

      if (error) throw error;
      setLessons((data ?? []) as LessonSummary[]);

      // Progress badges are best-effort; a failure here must not blank the list.
      try {
        const { data: progressRows, error: progressError } = await supabase
          .from('lesson_progress')
          .select('lesson_id,mastery_level')
          .eq('email', userEmail);

        if (progressError) throw progressError;
        const map: Record<string, MasteryLevel> = {};
        for (const row of progressRows ?? []) {
          if (row.lesson_id) map[row.lesson_id] = row.mastery_level as MasteryLevel;
        }
        setMasteryByLesson(map);
      } catch (err) {
        errorLogger.error(err, { component: 'LessonLibrary', action: 'load lesson progress' });
      }
    } catch (err) {
      errorLogger.error(err, { component: 'LessonLibrary', action: 'load lessons' });
      setLoadError(
        err instanceof Error ? err.message : 'Could not load lessons.'
      );
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [userEmail, wantedSubjects]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const openLessonById = useCallback(async (lessonId: string) => {
    setOpeningId(lessonId);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      if (data) setOpenLesson(data as unknown as Lesson);
    } catch (err) {
      errorLogger.error(err, { component: 'LessonLibrary', action: 'open lesson' });
    } finally {
      setOpeningId(null);
    }
  }, []);

  useEffect(() => {
    if (initialLessonId) openLessonById(initialLessonId);
  }, [initialLessonId, openLessonById]);

  // Subject/topic deep-link (study calendar, topic mastery): filter to the
  // subject and open the best match. Falls back to the filtered list when
  // no lesson matches — the library still shows relevant lessons.
  const deepLinkConsumed = useRef<string | null>(null);
  useEffect(() => {
    if (loading || lessons.length === 0) return;
    const subj = initialSubject?.toLowerCase() || null;
    if (!subj) return;
    const key = `${subj}::${initialTopic?.toLowerCase() || ''}`;
    if (deepLinkConsumed.current === key) return;
    deepLinkConsumed.current = key;

    setSubjectFilter(subj);
    const inSubject = lessons.filter((l) => l.subject.toLowerCase() === subj);
    if (inSubject.length === 0) return;
    const topic = initialTopic?.toLowerCase().trim();
    const match =
      (topic &&
        (inSubject.find((l) => l.topic.toLowerCase() === topic) ||
          inSubject.find(
            (l) =>
              l.topic.toLowerCase().includes(topic) ||
              topic.includes(l.topic.toLowerCase()) ||
              l.title.toLowerCase().includes(topic)
          ))) ||
      inSubject[0];
    if (match) void openLessonById(match.id);
  }, [loading, lessons, initialSubject, initialTopic, openLessonById]);

  const availableSubjects = useMemo(() => {
    const seen = new Set(lessons.map((l) => l.subject));
    return [...seen].sort();
  }, [lessons]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (subjectFilter && lesson.subject !== subjectFilter) return false;
      if (!q) return true;
      return (
        lesson.title.toLowerCase().includes(q) ||
        lesson.topic.toLowerCase().includes(q) ||
        lesson.subtopic.toLowerCase().includes(q)
      );
    });
  }, [lessons, query, subjectFilter]);

  const grouped = useMemo(() => {
    const groups = new Map<string, LessonSummary[]>();
    for (const lesson of filtered) {
      if (!groups.has(lesson.subject)) groups.set(lesson.subject, []);
      groups.get(lesson.subject)!.push(lesson);
    }
    return [...groups.entries()].sort((a, b) =>
      subjectLabel(a[0]).localeCompare(subjectLabel(b[0]))
    );
  }, [filtered]);

  const completedCount = useMemo(
    () => Object.values(masteryByLesson).filter((m) => m === 'mastered').length,
    [masteryByLesson]
  );

  if (openLesson) {
    return (
      <LessonReader
        lesson={openLesson}
        userEmail={userEmail}
        onExit={() => {
          setOpenLesson(null);
          loadLibrary();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2">
          <Layers className="w-7 h-7 text-primary" />
          Interactive Lessons
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading
            ? 'Loading your lessons...'
            : `${lessons.length} lesson${lessons.length === 1 ? '' : 's'} across ${availableSubjects.length} subject${availableSubjects.length === 1 ? '' : 's'}`}
          {completedCount > 0 && ` \u00b7 ${completedCount} mastered`}
        </p>
      </div>

      {loadError && (
        <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
              Could not load lessons
            </p>
            <p className="text-xs text-muted-foreground mt-1 break-words">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadLibrary}>
            Retry
          </Button>
        </div>
      )}

      {lessons.length > 0 && (
        <>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons..."
              className="pl-9"
            />
          </div>

          {availableSubjects.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-5">
              <Button
                variant={subjectFilter === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSubjectFilter(null)}
              >
                All
              </Button>
              {availableSubjects.map((subject) => (
                <Button
                  key={subject}
                  variant={subjectFilter === subject ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSubjectFilter(subjectFilter === subject ? null : subject)}
                >
                  {subjectLabel(subject)}
                </Button>
              ))}
            </div>
          )}
        </>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-semibold text-foreground">
            {lessons.length === 0 ? 'No lessons available yet' : 'No lessons match your search'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {lessons.length === 0
              ? loadError
                ? 'Check your connection and try again.'
                : 'Lessons for your subjects will appear here.'
              : 'Try a different subject or search term.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([subject, items]) => (
            <section key={subject}>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-bold text-foreground">{subjectLabel(subject)}</h2>
                <Badge variant="secondary" className="text-xs">
                  {items.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {items.map((lesson) => {
                  const mastery = masteryByLesson[lesson.id];
                  return (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => openLessonById(lesson.id)}
                      disabled={openingId === lesson.id}
                      className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-accent/40 transition-colors disabled:opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {openingId === lesson.id ? (
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          ) : mastery === 'mastered' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <PlayCircle className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm leading-snug">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {lesson.subtopic}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <Badge
                              className={`text-[10px] ${DIFFICULTY_STYLES[lesson.difficulty_level] ?? ''}`}
                            >
                              {lesson.difficulty_level}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.estimated_minutes} min
                            </span>
                            {mastery && mastery !== 'not_started' && (
                              <Badge className={`text-[10px] ${MASTERY_STYLES[mastery]}`}>
                                {mastery}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Full lesson player, wired to lesson_progress persistence. */
function LessonReader({
  lesson,
  userEmail,
  onExit,
}: {
  lesson: Lesson;
  userEmail: string;
  onExit: () => void;
}) {
  const { progress, markSectionViewed } = useLessonProgress(lesson.id, userEmail);
  const sectionsViewed = progress?.sections_viewed ?? [];

  const totalSections = lesson.content_sections?.length ?? 0;
  const percent =
    totalSections > 0 ? Math.round((sectionsViewed.length / totalSections) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={onExit} className="-ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          All lessons
        </Button>
      </div>

      <div className="mb-5">
        <p className="text-xs font-medium text-primary uppercase tracking-wide">
          {subjectLabel(lesson.subject)}
        </p>
        <h1 className="text-xl md:text-2xl font-extrabold text-foreground mt-1">
          {lesson.title}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <Progress value={percent} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground tabular-nums">{percent}%</span>
        </div>
      </div>

      <InteractiveLesson
        lesson={lesson}
        sectionsViewed={sectionsViewed}
        onSectionComplete={markSectionViewed}
      />
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, CheckCircle2, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useSeo } from '@/hooks/useSeo';
import { GoogleAdSense } from '@/components/GoogleAdSense';

/**
 * Public JAMB past-question browser.
 *
 * Why this exists: the question bank was publicly readable in the database but
 * never rendered on any page, so a search engine (and AdSense review) landing on
 * the site saw a marketing page and a login wall - no study content at all. That
 * is the direct cause of the "low value content" and "ads on screens without
 * publisher content" rejections.
 *
 * Real UTME past questions are public domain, so publishing them is not giving
 * the product away - the product is the practice experience, the AI tutoring and
 * the offline app. Showing the questions is what makes the site substantial.
 */

// UTME subjects only. commerce/accounting are WAEC subjects (never examined by
// JAMB) and are excluded everywhere else in the app now, so keep them out here.
export const PUBLIC_SUBJECTS = [
  'english', 'mathematics', 'physics', 'chemistry', 'biology',
  'literature', 'government', 'economics', 'crs', 'irs',
  'geography', 'agricultural_science',
] as const;

type PublicSubject = (typeof PUBLIC_SUBJECTS)[number];

const SUBJECT_LABELS: Record<string, string> = {
  english: 'English',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  literature: 'Literature in English',
  government: 'Government',
  economics: 'Economics',
  crs: 'Christian Religious Studies',
  irs: 'Islamic Religious Studies',
  geography: 'Geography',
  agricultural_science: 'Agricultural Science',
};

const SUBJECT_BLURBS: Record<string, string> = {
  english: 'Comprehension, lexis and structure, oral English and the unseen passage.',
  mathematics: 'Number and numeration, algebra, geometry, trigonometry and statistics.',
  physics: 'Measurements, mechanics, fields, waves, electricity and modern physics.',
  chemistry: 'Atomic structure, bonding, energetics, equilibria and organic chemistry.',
  biology: 'Cell biology, ecology, genetics, physiology and evolution.',
  literature: 'Prose, drama and poetry, including the set texts and unseen extracts.',
  government: 'Constitutional development, political institutions and international relations.',
  economics: 'Microeconomics, macroeconomics, economic development and trade.',
  crs: 'Old and New Testament narratives and Christian doctrine.',
  irs: 'Quranic passages, Hadith and Islamic jurisprudence.',
  geography: 'Physical geography, map work, human geography and Nigerian geography.',
  agricultural_science: 'Crop and animal production, soil science and agricultural economics.',
};

interface QuestionRow {
  id: string;
  subject: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  year: number | null;
  topics: string[] | null;
  is_ai_generated: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

const optionFor = (row: QuestionRow, letter: string): string => {
  switch (letter.toUpperCase()) {
    case 'A': return row.option_a;
    case 'B': return row.option_b;
    case 'C': return row.option_c;
    default: return row.option_d;
  }
};

const SubjectIndex = () => {
  useSeo({
    title: 'JAMB UTME Past Questions by Subject | Jamb Crash AI',
    description:
      'Real JAMB UTME past questions with answers and explanations, organised by subject. Browse English, Mathematics, Physics, Chemistry, Biology and more - free, no sign-up needed.',
    path: '/past-questions',
  });

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('jamb_questions')
          .select('subject')
          .in('subject', PUBLIC_SUBJECTS as unknown as Database['public']['Enums']['jamb_subject'][]);
        if (!alive) return;
        const tally: Record<string, number> = {};
        (data || []).forEach((r) => {
          if (r.subject) tally[r.subject] = (tally[r.subject] || 0) + 1;
        });
        setCounts(tally);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const total = useMemo(
    () => PUBLIC_SUBJECTS.reduce((sum, s) => sum + (counts[s] || 0), 0),
    [counts],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/90 sticky top-0 z-40 backdrop-blur">
        <div className="container max-w-5xl py-4 px-4 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <span className="text-sm font-medium">JAMB UTME Past Questions</span>
        </div>
      </header>

      <main className="container max-w-5xl px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          JAMB UTME Past Questions by Subject
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Real past questions with the correct option and a plain-language explanation for
          each one. Choose a subject below to start revising. Nothing here needs an account.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PUBLIC_SUBJECTS.map((subject) => (
            <Link
              key={subject}
              to={`/past-questions/${subject}`}
              className="group rounded-xl border border-border/70 bg-card p-5 hover:border-primary/60 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold leading-tight group-hover:text-primary">
                  {SUBJECT_LABELS[subject] || subject}
                </h2>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : `${counts[subject] || 0} questions`}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{SUBJECT_BLURBS[subject]}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-border/70 bg-card p-5 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">{total.toLocaleString()} past questions</strong>{' '}
            across the twelve UTME subjects. Each question shows the four options, the correct
            answer and a short explanation of why it is correct.
          </p>
        </div>

        <GoogleAdSense className="my-8" />

        <section className="mt-8 rounded-xl border border-border/70 bg-card p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Practice properly
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browsing past questions is only half the work. The Jamb Crash app times you under real
            exam conditions, adapts to the topics you keep getting wrong, and works fully offline.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start practising free
          </Link>
        </section>
      </main>
    </div>
  );
};

const SubjectPage = ({ subject }: { subject: PublicSubject }) => {
  const label = SUBJECT_LABELS[subject] || subject;

  useSeo({
    title: `${label} Past Questions and Answers | Jamb Crash AI`,
    description: `${SUBJECT_BLURBS[subject] || label} Real ${label} JAMB UTME past questions with the correct options and explanations. Free, no sign-up.`,
    path: `/past-questions/${subject}`,
  });

  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Real UTME past questions only (is_ai_generated = false). Those are public
      // domain and are what makes this page substantial and authentic. AI-written
      // practice items stay inside the app where they belong.
      const { data, error: err } = await supabase
        .from('jamb_questions')
        .select('id, subject, question, option_a, option_b, option_c, option_d, correct_answer, explanation, year, topics, is_ai_generated')
        .eq('subject', subject)
        .eq('is_ai_generated', false)
        .order('year', { ascending: false })
        .limit(400);
      if (err) throw err;
      setQuestions(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load questions');
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (row) =>
        (row.question || '').toLowerCase().includes(q) ||
        (row.topics || []).some((t) => t.toLowerCase().includes(q)),
    );
  }, [questions, query]);

  const toggleReveal = (id: string) =>
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/90 sticky top-0 z-40 backdrop-blur">
        <div className="container max-w-4xl py-4 px-4 flex items-center justify-between gap-4">
          <Link to="/past-questions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> All subjects
          </Link>
          <span className="text-sm font-medium">{label}</span>
        </div>
      </header>

      <main className="container max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">{label} Past Questions</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          {SUBJECT_BLURBS[subject]}. Real UTME past questions with answers and explanations.
          Try each one before revealing the answer.
        </p>

        {!loading && !error && (
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label} questions and topics`}
              className="w-full rounded-lg border border-border/70 bg-card pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
        )}

        {loading && (
          <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading past questions…
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">No questions match that search.</p>
        )}

        <ol className="mt-8 space-y-6">
          {filtered.map((row, i) => {
            const show = !!revealed[row.id];
            const correct = (row.correct_answer || '').trim().toUpperCase();
            return (
              <li key={row.id} className="rounded-xl border border-border/70 bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-relaxed">{row.question}</p>
                    {(row.year || (row.topics && row.topics.length > 0)) && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {row.year && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{row.year}</span>}
                        {(row.topics || []).slice(0, 4).map((t) => (
                          <span key={t} className="rounded-full bg-muted px-2 py-0.5">{t}</span>
                        ))}
                      </div>
                    )}

                    <ul className="mt-4 space-y-2">
                      {OPTION_LETTERS.map((letter) => {
                        const isCorrect = show && letter === correct;
                        return (
                          <li
                            key={letter}
                            className={
                              isCorrect
                                ? 'rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-sm font-medium'
                                : 'rounded-lg border border-border/60 px-3 py-2 text-sm'
                            }
                          >
                            <span className="font-semibold mr-2">{letter}.</span>
                            {optionFor(row, letter)}
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      type="button"
                      onClick={() => toggleReveal(row.id)}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      {show ? 'Hide answer' : 'Show answer'}
                    </button>

                    {show && (
                      <div className="mt-4 rounded-lg border border-primary/40 bg-primary/5 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <CheckCircle2 className="w-4 h-4" /> Answer: {correct}
                        </p>
                        {row.explanation && (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            {row.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <GoogleAdSense className="my-8" />

        <section className="mt-8 rounded-xl border border-border/70 bg-card p-6">
          <h2 className="text-xl font-semibold">Practise {label} under exam conditions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Timed sets, your weak topics marked for you, and full offline support for when the
            network drops on revision night.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open the free app
          </Link>
        </section>
      </main>
    </div>
  );
};

const PastQuestions = () => {
  const { subject } = useParams<{ subject: string }>();

  // Unknown subject slug -> send them to the subject index rather than a blank
  // page or a crash.
  if (subject && !PUBLIC_SUBJECTS.includes(subject as PublicSubject)) {
    return <SubjectIndex />;
  }

  return subject ? (
    <SubjectPage subject={subject as PublicSubject} />
  ) : (
    <SubjectIndex />
  );
};

export default PastQuestions;

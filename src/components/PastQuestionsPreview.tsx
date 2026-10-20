import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PreviewRow {
  id: string;
  subject: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

const optionFor = (row: PreviewRow, letter: string): string => {
  switch (letter.toUpperCase()) {
    case 'A': return row.option_a;
    case 'B': return row.option_b;
    case 'C': return row.option_c;
    default: return row.option_d;
  }
};

/**
 * A real past question pulled from the bank and shown on the landing page.
 *
 * The landing page was pure marketing, which is one of the things the AdSense
 * review flagged: the site's actual substance (thousands of past questions) was
 * never visible to a crawler. Showing a genuine question here makes the first
 * page a real content page and gives search engines something to index.
 */
export const PastQuestionsPreview = () => {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('jamb_questions')
          .select('id, subject, question, option_a, option_b, option_c, option_d, correct_answer')
          .eq('is_ai_generated', false)
          .limit(3);
        if (alive) setRows(data || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section id="past-questions" className="py-16">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Real UTME past questions
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Every question below is a real past question with the correct option. Thousands more
              are inside the app, with explanations and timed practice.
            </p>
          </div>
          <Link
            to="/past-questions"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline shrink-0"
          >
            Browse all past questions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading past questions…
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {rows.map((row) => {
              const correct = (row.correct_answer || '').trim().toUpperCase();
              return (
                <Link
                  key={row.id}
                  to={`/past-questions/${row.subject}`}
                  className="rounded-xl border border-border/70 bg-card p-5 hover:border-primary/60 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {row.subject.replace('_', ' ')}
                  </span>
                  <p className="mt-2 text-sm font-medium leading-relaxed line-clamp-3">
                    {row.question}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    {correct}. {optionFor(row, correct)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

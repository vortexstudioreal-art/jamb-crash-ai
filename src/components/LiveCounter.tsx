import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Honest counter: real question-bank stats, not a fabricated "live" number.
interface CounterStats {
  questions: number;
}

export const LiveCounter = () => {
  const [stats, setStats] = useState<CounterStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Exact count only (head query, no rows transferred).
        const { count, error } = await supabase
          .from('jamb_questions')
          .select('id', { count: 'exact', head: true });
        if (error || cancelled || count == null) return;
        setStats({ questions: count });
      } catch {
        // offline — leave the fallback rendering below
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-card border border-border shadow-card"
    >
      <div className="badge-live">
        <BookOpen className="w-4 h-4" />
        <span className="font-semibold">
          {stats ? stats.questions.toLocaleString() : '4,700+'}
        </span>
      </div>
      <span className="text-sm text-muted-foreground">
        real past questions to practice
      </span>
    </motion.div>
  );
};

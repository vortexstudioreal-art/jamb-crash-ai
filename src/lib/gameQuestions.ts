import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { getQuestions } from '@/services/offlineStorage';
import { shuffleQuestionList } from '@/lib/quizShuffle';
import { errorLogger } from '@/services/errorLogger';

export interface GameQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  subject: string;
  [key: string]: unknown;
}

// UTME subjects only - commerce/accounting are WAEC subjects, never examined
// by JAMB, and commerce alone was holding 737 questions of the bank.
export const ALL_GAME_SUBJECTS = [
  'english', 'mathematics', 'physics', 'chemistry', 'biology',
  'literature', 'government', 'economics', 'crs', 'irs',
  'geography', 'agricultural_science',
];

// Recently served question IDs (in-memory). Excluded from fresh pools so
// restarts and back-to-back rounds stop repeating the same questions.
const recentIds: string[] = [];

export const rememberQuestionIds = (ids: string[]) => {
  for (const id of ids) {
    if (id && !recentIds.includes(id)) recentIds.push(id);
  }
  while (recentIds.length > 300) recentIds.shift();
};

const optionOf = (q: GameQuestion, letter: string): string =>
  (q[`option_${letter.toLowerCase()}`] as string) || '';

const isPlayable = (q: GameQuestion): boolean =>
  !!q.question &&
  !!q.correct_answer &&
  ['A', 'B', 'C', 'D'].includes((q.correct_answer || '').toUpperCase()) &&
  ['A', 'B', 'C', 'D'].every((l) => optionOf(q, l).trim().length > 0);

/**
 * Offline-first question pool for arcade games. Reads the auto-seeded
 * IndexedDB bank first (works with zero connectivity), tops up from
 * Supabase when online, shuffles, caps at `limit`.
 */
export const loadGameQuestions = async (
  subjects: string[],
  limit = 60
): Promise<GameQuestion[]> => {
  let pool: GameQuestion[] = [];
  try {
    const cached = await getQuestions(subjects);
    pool = (cached as unknown as GameQuestion[]).filter(isPlayable);
  } catch {
    // cache is best-effort
  }

  if (pool.length < 10 && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const { data } = await supabase
        .from('jamb_questions')
        .select('id, question, option_a, option_b, option_c, option_d, correct_answer, subject')
        .in('subject', subjects as Database['public']['Enums']['jamb_subject'][])
        .limit(100);
      if (data) {
        const fresh = (data as unknown as GameQuestion[]).filter(isPlayable);
        const seen = new Set(pool.map((q) => q.id));
        for (const q of fresh) {
          if (!seen.has(q.id)) {
            pool.push(q);
            seen.add(q.id);
          }
        }
      }
    } catch (err) {
      errorLogger.error(err, { component: 'gameQuestions', action: 'top-up' });
    }
  }

  return shuffleQuestionList(preferFresh(pool)).slice(0, limit) as GameQuestion[];
};

const preferFresh = (pool: GameQuestion[]): GameQuestion[] => {
  if (recentIds.length === 0) return pool;
  const fresh = pool.filter((q) => !recentIds.includes(q.id));
  // Keep at least 10 cards; if memory ate the pool, fall back to full pool
  // rather than an empty game.
  return fresh.length >= 10 ? fresh : pool;
};

export const gameOptionOf = optionOf;

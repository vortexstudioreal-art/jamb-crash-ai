// Deterministic per-question option shuffler to remove the "B is usually correct" bias.
// Returns a new question object where option_a/b/c/d positions are randomised AND
// correct_answer is remapped to the new letter that now holds the originally correct text.
export interface ShuffleableQuestion {
  id: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  [key: string]: any;
}

// Mulberry32 — stable PRNG seeded from the question id so the same question
// always shuffles the same way for one user (review screens stay consistent)
// but different questions get different shuffles.
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleQuestionOptions<T extends ShuffleableQuestion>(q: T): T {
  if (!q || !q.id || !q.correct_answer) return q;
  const letters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const originalTexts: Record<string, string> = {
    A: q.option_a,
    B: q.option_b,
    C: q.option_c,
    D: q.option_d,
  };

  const rand = mulberry32(hashString(q.id));
  const order = [...letters];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  // order[0] is the original letter that should now sit in slot A, etc.
  const newOptions: Record<string, string> = {};
  let newCorrect = q.correct_answer;
  order.forEach((origLetter, idx) => {
    const newLetter = letters[idx];
    newOptions[`option_${newLetter.toLowerCase()}`] = originalTexts[origLetter] ?? '';
    if (origLetter === q.correct_answer) newCorrect = newLetter;
  });

  return {
    ...q,
    ...newOptions,
    correct_answer: newCorrect,
  } as T;
}

export function shuffleQuestionList<T extends ShuffleableQuestion>(qs: T[]): T[] {
  return qs.map(shuffleQuestionOptions);
}
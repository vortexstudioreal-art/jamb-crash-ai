export interface AttemptQuestion {
  id?: string;
  userAnswer?: string;
  correct_answer?: string;
}

/**
 * Count how many times each question was answered wrongly across recent attempts.
 * Returns a Map<questionId, wrongCount> sorted by frequency descending.
 */
export const collectWeakQuestionCounts = (
  attemptsData: unknown[],
): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const attempt of attemptsData) {
    if (!Array.isArray(attempt)) continue;
    for (const q of attempt as AttemptQuestion[]) {
      if (!q.id || !q.userAnswer) continue;
      if (q.userAnswer !== q.correct_answer) {
        counts.set(q.id, (counts.get(q.id) || 0) + 1);
      }
    }
  }
  return new Map(
    [...counts.entries()].sort((a, b) => b[1] - a[1]),
  );
};

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * Adaptive selection: prioritizes questions the user has answered wrongly before.
 * `weakRatio` (default 0.6) of the selection comes from weak questions (most-missed first),
 * the rest comes from the remaining pool to keep variety.
 */
export const pickAdaptive = <T extends { id: string }>(
  pool: T[],
  weakCounts: Map<string, number>,
  count: number,
  weakRatio = 0.6,
): T[] => {
  if (pool.length <= count) return shuffle(pool);

  const byId = new Map(pool.map(q => [q.id, q]));
  const weakInPool: T[] = [];
  for (const [id] of weakCounts) {
    const q = byId.get(id);
    if (q) weakInPool.push(q);
  }

  const weakTarget = Math.min(weakInPool.length, Math.round(count * weakRatio));
  const freshTarget = count - weakTarget;

  const weakPick = shuffle(weakInPool).slice(0, weakTarget);
  const weakIds = new Set(weakPick.map(q => q.id));
  const freshPool = pool.filter(q => !weakIds.has(q.id));

  return shuffle([...weakPick, ...shuffle(freshPool).slice(0, freshTarget)]);
};

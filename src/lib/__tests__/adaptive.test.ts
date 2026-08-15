import { describe, it, expect } from 'vitest';
import { collectWeakQuestionCounts, pickAdaptive } from '../adaptive';

describe('collectWeakQuestionCounts', () => {
  it('counts wrong answers per question', () => {
    const attempts = [
      [{ id: 'q1', userAnswer: 'A', correct_answer: 'B' }, { id: 'q2', userAnswer: 'C', correct_answer: 'C' }],
      [{ id: 'q1', userAnswer: 'A', correct_answer: 'B' }, { id: 'q3', userAnswer: 'D', correct_answer: 'A' }],
    ];
    const counts = collectWeakQuestionCounts(attempts);
    expect(counts.get('q1')).toBe(2);
    expect(counts.has('q2')).toBe(false); // correct answer
    expect(counts.get('q3')).toBe(1);
  });

  it('ignores attempts with missing id or userAnswer', () => {
    const attempts = [
      [{ userAnswer: 'A', correct_answer: 'B' }],
      [{ id: 'q1', correct_answer: 'B' }],
    ];
    const counts = collectWeakQuestionCounts(attempts);
    expect(counts.size).toBe(0);
  });

  it('handles non-array items gracefully', () => {
    const counts = collectWeakQuestionCounts([null, 'string', 42]);
    expect(counts.size).toBe(0);
  });

  it('returns entries sorted by frequency descending', () => {
    const attempts = [
      [{ id: 'q1', userAnswer: 'A', correct_answer: 'B' }],
      [{ id: 'q2', userAnswer: 'A', correct_answer: 'B' }],
      [{ id: 'q2', userAnswer: 'A', correct_answer: 'B' }],
    ];
    const counts = collectWeakQuestionCounts(attempts);
    const entries = [...counts.entries()];
    expect(entries[0][0]).toBe('q2');
    expect(entries[0][1]).toBe(2);
  });
});

describe('pickAdaptive', () => {
  const pool = [
    { id: 'w1' }, { id: 'w2' }, { id: 'w3' },
    { id: 'f1' }, { id: 'f2' }, { id: 'f3' }, { id: 'f4' }, { id: 'f5' },
  ];

  it('returns all items if pool is smaller than count', () => {
    const small = [{ id: 'a' }, { id: 'b' }];
    const result = pickAdaptive(small, new Map(), 10);
    expect(result).toHaveLength(2);
  });

  it('returns exactly count items', () => {
    const weakCounts = new Map([['w1', 3], ['w2', 2]]);
    const result = pickAdaptive(pool, weakCounts, 5);
    expect(result).toHaveLength(5);
  });

  it('prioritizes weak questions', () => {
    const weakCounts = new Map([['w1', 3], ['w2', 2], ['w3', 1]]);
    const result = pickAdaptive(pool, weakCounts, 5, 0.6);
    const ids = result.map(q => q.id);
    const weakCount = ids.filter(id => id.startsWith('w')).length;
    // With 0.6 ratio and 5 picks, expect ~3 weak questions
    expect(weakCount).toBeGreaterThanOrEqual(2);
    expect(weakCount).toBeLessThanOrEqual(3);
  });

  it('shuffles the result (non-deterministic check with many runs)', () => {
    const weakCounts = new Map([['w1', 3]]);
    const orders = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const result = pickAdaptive(pool, weakCounts, 4);
      orders.add(result.map(q => q.id).join(','));
    }
    // With randomness, we should see at least 2 different orderings in 20 runs
    expect(orders.size).toBeGreaterThan(1);
  });

  it('handles empty weakCounts', () => {
    const result = pickAdaptive(pool, new Map(), 4);
    expect(result).toHaveLength(4);
  });

  it('handles weak questions not in pool', () => {
    const weakCounts = new Map([['missing1', 5], ['missing2', 3]]);
    const result = pickAdaptive(pool, weakCounts, 4);
    expect(result).toHaveLength(4);
  });
});

import { describe, it, expect } from 'vitest';
import { shuffleQuestionOptions, shuffleQuestionList, type ShuffleableQuestion } from '../quizShuffle';

const makeQ = (id: string, correct: string): ShuffleableQuestion => ({
  id,
  option_a: 'alpha',
  option_b: 'bravo',
  option_c: 'charlie',
  option_d: 'delta',
  correct_answer: correct,
});

describe('shuffleQuestionOptions', () => {
  it('preserves the correct answer text after shuffling', () => {
    const q = makeQ('q1', 'B');
    const shuffled = shuffleQuestionOptions(q);
    const options = [shuffled.option_a, shuffled.option_b, shuffled.option_c, shuffled.option_d];
    expect(options).toContain('bravo');
  });

  it('remaps correct_answer to the new letter holding the original text', () => {
    const q = makeQ('q1', 'C');
    const shuffled = shuffleQuestionOptions(q);
    const letterMap: Record<string, string> = {
      A: shuffled.option_a,
      B: shuffled.option_b,
      C: shuffled.option_c,
      D: shuffled.option_d,
    };
    expect(letterMap[shuffled.correct_answer]).toBe('charlie');
  });

  it('is deterministic for the same question id', () => {
    const q = makeQ('stable-id', 'A');
    const s1 = shuffleQuestionOptions(q);
    const s2 = shuffleQuestionOptions(q);
    expect(s1.option_a).toBe(s2.option_a);
    expect(s1.option_b).toBe(s2.option_b);
    expect(s1.option_c).toBe(s2.option_c);
    expect(s1.option_d).toBe(s2.option_d);
    expect(s1.correct_answer).toBe(s2.correct_answer);
  });

  it('returns the question unchanged if missing id or correct_answer', () => {
    const q = { ...makeQ('q2', 'A'), id: '', correct_answer: 'A' };
    expect(shuffleQuestionOptions(q)).toBe(q);
  });

  it('produces a permutation (not always the original order)', () => {
    const q = makeQ('q3', 'D');
    const shuffled = shuffleQuestionOptions(q);
    // All 4 option values should still be present
    const values = [shuffled.option_a, shuffled.option_b, shuffled.option_c, shuffled.option_d];
    expect(values.sort()).toEqual(['alpha', 'bravo', 'charlie', 'delta']);
  });
});

describe('shuffleQuestionList', () => {
  it('shuffles every question in the list', () => {
    const qs = [makeQ('a', 'A'), makeQ('b', 'B'), makeQ('c', 'C')];
    const result = shuffleQuestionList(qs);
    expect(result).toHaveLength(3);
    for (const q of result) {
      const values = [q.option_a, q.option_b, q.option_c, q.option_d];
      expect(values.sort()).toEqual(['alpha', 'bravo', 'charlie', 'delta']);
    }
  });

  it('does not mutate the original array', () => {
    const qs = [makeQ('x', 'A'), makeQ('y', 'B')];
    const original = qs.map(q => ({ ...q }));
    shuffleQuestionList(qs);
    expect(qs[0].option_a).toBe(original[0].option_a);
  });
});

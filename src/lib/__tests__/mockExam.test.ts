import { describe, it, expect } from 'vitest';
import { buildMockSections, gradeMock, scoreBand, type MockQuestion } from '../mockExam';

describe('buildMockSections', () => {
  it('always includes English as the first section', () => {
    const sections = buildMockSections(['mathematics', 'physics']);
    expect(sections[0].key).toBe('english');
    expect(sections[0].questionCount).toBe(60);
  });

  it('adds up to 3 subject sections', () => {
    const sections = buildMockSections(['mathematics', 'physics', 'chemistry', 'biology']);
    expect(sections).toHaveLength(4); // english + 3
  });

  it('capitalizes subject names in title', () => {
    const sections = buildMockSections(['mathematics']);
    const math = sections.find(s => s.key === 'mathematics');
    expect(math?.title).toBe('Mathematics');
  });

  it('handles single-word underscore subjects', () => {
    const sections = buildMockSections(['physics']);
    const found = sections.find(s => s.key === 'physics');
    expect(found?.title).toBe('Physics');
  });
});

describe('gradeMock', () => {
  const sections = [
    { key: 'english', title: 'English', subject: 'english', questionCount: 4, minutes: 60 },
    { key: 'math', title: 'Math', subject: 'mathematics', questionCount: 2, minutes: 50 },
    { key: 'physics', title: 'Physics', subject: 'physics', questionCount: 2, minutes: 50 },
    { key: 'chemistry', title: 'Chemistry', subject: 'chemistry', questionCount: 2, minutes: 50 },
  ];

  const questions: MockQuestion[][] = [
    [
      { id: 'e1', question: 'Q', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'A', subject: 'english' },
      { id: 'e2', question: 'Q', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'B', subject: 'english' },
      { id: 'e3', question: 'Q', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'C', subject: 'english' },
      { id: 'e4', question: 'Q', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'D', subject: 'english' },
    ],
    [
      { id: 'm1', question: 'Q', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'A', subject: 'mathematics' },
      { id: 'm2', question: 'Q', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'B', subject: 'mathematics' },
    ],
    [
      { id: 'p1', question: 'Q', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'A', subject: 'physics' },
      { id: 'p2', question: 'Q', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'B', subject: 'physics' },
    ],
    [
      { id: 'c1', question: 'Q', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'A', subject: 'chemistry' },
      { id: 'c2', question: 'Q', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D', correct_answer: 'B', subject: 'chemistry' },
    ],
  ];

  it('scores 400 when all answers are correct', () => {
    const answers = {
      english: { e1: 'A', e2: 'B', e3: 'C', e4: 'D' },
      math: { m1: 'A', m2: 'B' },
      physics: { p1: 'A', p2: 'B' },
      chemistry: { c1: 'A', c2: 'B' },
    };
    const results = gradeMock(sections, questions, answers, { english: 60, math: 50, physics: 50, chemistry: 50 });
    expect(results.totalScore).toBe(400);
    expect(results.maxScore).toBe(400);
  });

  it('scores 0 when all answers are wrong', () => {
    const answers = {
      english: { e1: 'B', e2: 'A', e3: 'D', e4: 'C' },
      math: { m1: 'B', m2: 'A' },
      physics: { p1: 'B', p2: 'A' },
      chemistry: { c1: 'B', c2: 'A' },
    };
    const results = gradeMock(sections, questions, answers, {});
    expect(results.totalScore).toBe(0);
  });

  it('uses best 3 subject scores (drops worst if 4+ subjects)', () => {
    const answers = {
      english: { e1: 'A', e2: 'B', e3: 'C', e4: 'D' },
      math: { m1: 'A', m2: 'B' },
      physics: { p1: 'B', p2: 'A' }, // 0%
      chemistry: { c1: 'A', c2: 'B' }, // 100%
    };
    const results = gradeMock(sections, questions, answers, {});
    // English 100 + math 100 + chemistry 100 = 300, physics dropped
    expect(results.totalScore).toBe(300);
  });

  it('returns section-level results', () => {
    const answers = {
      english: { e1: 'A', e2: 'A', e3: 'A', e4: 'A' },
      math: { m1: 'A', m2: 'B' },
      physics: { p1: 'A', p2: 'A' },
      chemistry: { c1: 'A', c2: 'A' },
    };
    const results = gradeMock(sections, questions, answers, { english: 120, math: 30 });
    expect(results.sections).toHaveLength(4);
    expect(results.sections[0].correct).toBe(1);
    expect(results.sections[0].total).toBe(4);
    expect(results.sections[1].correct).toBe(2);
    expect(results.timeTakenSec).toBe(150);
  });
});

describe('scoreBand', () => {
  it('returns Outstanding for 320+', () => {
    expect(scoreBand(320).label).toContain('Outstanding');
    expect(scoreBand(400).label).toContain('Outstanding');
  });

  it('returns Excellent for 280-319', () => {
    expect(scoreBand(280).label).toContain('Excellent');
    expect(scoreBand(319).label).toContain('Excellent');
  });

  it('returns Very Good for 250-279', () => {
    expect(scoreBand(250).label).toContain('Very Good');
    expect(scoreBand(279).label).toContain('Very Good');
  });

  it('returns Good for 200-249', () => {
    expect(scoreBand(200).label).toContain('Good');
    expect(scoreBand(249).label).toContain('Good');
  });

  it('returns Keep Going for below 200', () => {
    expect(scoreBand(100).label).toContain('Keep Going');
    expect(scoreBand(0).label).toContain('Keep Going');
  });
});

import { describe, it, expect } from 'vitest';
import { classifyTopic, computeMastery } from '../mastery';

describe('classifyTopic', () => {
  it('uses word boundaries (sin must not match business)', () => {
    expect(classifyTopic('The businessman counts his profit daily', 'physics')).toBe('General Concepts');
  });

  it('does not match cell inside excellent', () => {
    expect(classifyTopic('This is an excellent result', 'biology')).toBe('General Concepts');
  });

  it('picks the topic with the most keyword hits', () => {
    const text = 'Solve the quadratic equation and find the variable x';
    expect(classifyTopic(text, 'mathematics')).toBe('Algebra');
  });

  it('prefers stored topics over keywords', () => {
    expect(classifyTopic('Solve for x', 'mathematics', ['Geometry'])).toBe('Geometry');
  });

  it('returns General Concepts for unknown subjects', () => {
    expect(classifyTopic('Anything at all', 'history')).toBe('General Concepts');
  });
});

describe('computeMastery', () => {
  const mk = (correct: boolean, daysAgo: number, subject = 'physics', text = 'force and motion') => ({
    subject,
    text,
    correct,
    at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  });

  it('caps thin samples below mastered', () => {
    const res = computeMastery([mk(true, 0)]);
    expect(res[0].topics[0].level).toBe('learning');
    expect(res[0].topics[0].lowData).toBe(true);
  });

  it('demands six samples plus a 3-streak for mastered', () => {
    const five = Array.from({ length: 5 }, () => mk(true, 0));
    expect(computeMastery(five)[0].topics[0].level).toBe('proficient');
    const six = [...five, mk(true, 0)];
    expect(computeMastery(six)[0].topics[0].level).toBe('mastered');
    // broken streak at the end -> back to proficient
    const older = [2, 3, 4, 5, 6].map((d) => mk(true, d));
    const broken = [...older, mk(false, 0)];
    expect(computeMastery(broken)[0].topics[0].level).not.toBe('mastered');
  });

  it('weights recent attempts more than old ones', () => {
    const samples = [
      ...Array.from({ length: 5 }, () => mk(false, 90)),
      ...Array.from({ length: 5 }, () => mk(true, 0)),
    ];
    const res = computeMastery(samples);
    // 5/10 raw but all recent correct -> weighted percentage well above 50
    expect(res[0].topics[0].percentage).toBeGreaterThan(80);
  });

  it('detects an improving trend', () => {
    const samples = [
      ...Array.from({ length: 4 }, (_, i) => mk(false, 60 - i)),
      ...Array.from({ length: 4 }, (_, i) => mk(true, 3 - i * 0.1)),
    ];
    const res = computeMastery(samples);
    expect(res[0].topics[0].trend).toBe('improving');
  });

  it('rolls up subject overall and weakest topic', () => {
    const samples = [
      ...Array.from({ length: 4 }, () => ({ ...mk(true, 0), text: 'force and motion' })),
      ...Array.from({ length: 4 }, () => ({ ...mk(false, 0), text: 'voltage and current in a circuit' })),
    ];
    const res = computeMastery(samples);
    expect(res[0].subject).toBe('physics');
    expect(res[0].weakest?.topic).toBe('Electricity');
    expect(res[0].overall).toBe(50);
  });
});

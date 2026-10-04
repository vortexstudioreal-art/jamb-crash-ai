import { describe, it, expect } from 'vitest';
import { collectLessons } from '../generate-lessons-migration.mjs';

/**
 * Content QA that is cheap to enforce mechanically. These are the mistakes that
 * actually shipped once: a doubled word, a duplicated "HMS", a garbled proper
 * noun. Prose cannot be fact-checked by a regex, but these can be, and they are
 * embarrassing in front of students.
 */

const lessons = collectLessons();

function walk(node, visit, path = []) {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, visit, [...path, i]));
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'string') visit(v, [...path, k].join('.'));
    else walk(v, visit, [...path, k]);
  }
}

const allStrings = lessons.flatMap((l) => {
  const out = [];
  walk(l, (text, where) => out.push({ lesson: `${l.subject}/${l.topic}`, where, text }));
  return out;
});

describe('lesson content hygiene', () => {
  it('has no doubled words', () => {
    // "Maji Maji" is one word repeated as a proper noun, not a typo.
    const allowed = ['maji maji', 'peter peter', 'by by'];

    const bad = allStrings
      .filter((s) => {
        const m = s.text.match(/\b(\w+)\s+\1\b/i);
        return m && !allowed.includes(m[0].toLowerCase());
      })
      .map((s) => `${s.lesson} ${s.where}: ${s.text.match(/\b(\w+)\s+\1\b/i)[0]}`);

    expect(bad).toEqual([]);
  });

  it('has no known garbled or duplicated proper nouns', () => {
    const banned = [
      'HMS HMS',
      'Abeokaste',
      'Wa Nome',
      'teh ',
      'Teh ',
      'recieve',
      'seperate',
      'occured',
      'independant',
      'goverment',
      'definately',
    ];

    const bad = allStrings
      .filter((s) => banned.some((b) => s.text.includes(b)))
      .map((s) => `${s.lesson} ${s.where}`);

    expect(bad).toEqual([]);
  });

  it('has no leftover mojibake or template placeholders', () => {
    const bad = allStrings
      .filter((s) => /\uFFFD|undefined|NaN|\[object Object\]|\{\{|\}\}/.test(s.text))
      .map((s) => `${s.lesson} ${s.where}: ${s.text.slice(0, 60)}`);

    expect(bad).toEqual([]);
  });

  it('keeps history dates consistent: no Lagos bombardment in 1879', () => {
    const bad = allStrings.filter((s) => /1879[^.]{0,80}bombard|bombard[^.]{0,80}1879/i.test(s.text));
    expect(bad.map((s) => `${s.lesson} ${s.where}`)).toEqual([]);
  });

  it('does not claim the UN Charter asserts self-determination', () => {
    // The 1945 UN Charter does not assert it; UNGA Resolution 1514 (1960) does.
    // The Atlantic Charter of 1941 is a different document and did invoke it.
    const bad = allStrings.filter((s) =>
      /UN Charter[^.]{0,80}self-determination|self-determination[^.]{0,80}UN Charter/i.test(s.text)
    );
    expect(bad.map((s) => `${s.lesson} ${s.where}`)).toEqual([]);
  });

  it('does not route palm oil through the Americas', () => {
    const bad = allStrings.filter((s) => /American commodities[^.]{0,120}palm oil/i.test(s.text));
    expect(bad.map((s) => `${s.lesson} ${s.where}`)).toEqual([]);
  });

  it('keeps every interactive instruction consistent with the widget', () => {
    // FieldLineViewer has a separation slider, not drag handles.
    const bad = allStrings.filter(
      (s) => /field_line_viewer/.test(s.text) === false && /\bdrag\b/i.test(s.text) && /charge/i.test(s.text)
    );
    expect(bad.map((s) => `${s.lesson} ${s.where}`)).toEqual([]);
  });
});

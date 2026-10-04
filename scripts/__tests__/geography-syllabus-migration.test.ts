import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectLessons } from '../../scripts/generate-lessons-migration.mjs';

const GEOGRAPHY_MIGRATION = 'supabase/migrations/20260813000000_seed_geography_syllabus.sql';
const sql = readFileSync(join(process.cwd(), GEOGRAPHY_MIGRATION), 'utf8');

const statements = sql.split(/(?=INSERT INTO)/).filter((s) => s.startsWith('INSERT INTO'));

/** Walks the file the way Postgres does: inside a literal only '' is an escape. */
function auditLiterals(source: string) {
  const unterminated: number[] = [];
  let literals = 0;

  statements.forEach((statement, index) => {
    let inString = false;
    for (let i = 0; i < statement.length; i++) {
      if (statement[i] !== "'") continue;
      if (inString && statement[i + 1] === "'") {
        i++;
        continue;
      }
      if (inString) {
        literals++;
        inString = false;
      } else {
        inString = true;
      }
    }
    if (inString) unterminated.push(index + 1);
  });

  return { unterminated, literals };
}

/** Each statement is `SELECT 'geography', '<topic>', ...`. */
function topicOf(statement: string): string | undefined {
  const match = statement.match(/SELECT\s+'([a-z_]+)',\s*'([^']+)'/);
  return match?.[2];
}

/** The trailing VALUES are `'<difficulty>', <minutes>, <order_index>`. */
function orderIndexOf(statement: string): number | undefined {
  const tail = statement.slice(0, statement.indexOf('WHERE NOT EXISTS'));
  const match = tail.match(/'(\w+)',\s*(\d+),\s*(\d+)\s*$/);
  return match ? Number(match[3]) : undefined;
}

function minutesOf(statement: string): number | undefined {
  const tail = statement.slice(0, statement.indexOf('WHERE NOT EXISTS'));
  const match = tail.match(/'(\w+)',\s*(\d+),\s*(\d+)\s*$/);
  return match ? Number(match[2]) : undefined;
}

describe('geography syllabus migration', () => {
  const { unterminated, literals } = auditLiterals(sql);

  it('closes every string literal', () => {
    expect(unterminated).toEqual([]);
  });

  it('balances parentheses in every statement', () => {
    const unbalanced = statements
      .map((s, i) => [(s.match(/\(/g) ?? []).length, (s.match(/\)/g) ?? []).length, i + 1])
      .filter(([open, close]) => open !== close)
      .map(([, , n]) => n);
    expect(unbalanced).toEqual([]);
  });

  it('inserts one syllabus row per statement', () => {
    expect(statements).toHaveLength(10);
  });

  it('extracts a topic and order index from every statement', () => {
    // If either helper returns undefined the assertions below are vacuous.
    for (const statement of statements) {
      expect(topicOf(statement)).toBeTruthy();
      expect(orderIndexOf(statement)).toBeTypeOf('number');
      expect(minutesOf(statement)).toBeTypeOf('number');
    }
  });

  it('guards every insert with NOT EXISTS so re-running is safe', () => {
    // jamb_syllabus has no unique constraint, so idempotency is manual.
    const guards = sql.match(/WHERE NOT EXISTS/g) ?? [];
    expect(guards).toHaveLength(statements.length);
  });

  it('only writes geography rows', () => {
    for (const statement of statements) {
      expect(statement).toContain("SELECT 'geography'");
    }
  });

  it('covers every seeded geography lesson topic', () => {
    // These must match the lesson `topic` strings verbatim, otherwise the
    // SyllabusReader deep link (subject + topic) cannot resolve.
    const lessonTopics = collectLessons()
      .filter((l) => l.subject === 'geography')
      .map((l) => l.topic);

    expect(lessonTopics.length).toBe(5);

    const syllabusTopics = statements.map(topicOf);
    for (const topic of lessonTopics) {
      expect(syllabusTopics).toContain(topic);
    }
  });

  it('numbers topics 1..10 like the other social-science subjects', () => {
    // history, economics, commerce and crs number from 1; the
    // english..agricultural_science block runs 0..82. Geography is a
    // social-science subject, so it follows the former.
    const indexes = statements.map(orderIndexOf);
    expect(indexes).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('gives every topic objectives and a positive reading time', () => {
    expect(sql.match(/ARRAY\[/g) ?? []).toHaveLength(statements.length);
    for (const statement of statements) {
      expect(minutesOf(statement)).toBeGreaterThan(0);
    }
  });

  it('escapes possessives rather than leaving bare apostrophes', () => {
    // Guards the exact bug this migration first shipped with: two unescaped
    // "Nigeria's" silently terminated their string literals.
    expect(sql).toContain("Nigeria''s");
    expect(sql).not.toMatch(/Nigeria's/);
  });

  it('supplies at least the eight literals each statement needs', () => {
    expect(literals).toBeGreaterThanOrEqual(statements.length * 8);
  });
});

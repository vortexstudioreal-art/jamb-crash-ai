import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  collectLessons,
  buildMigration,
  toSql,
  parseSqlLiteral,
  OUT,
} from '../../scripts/generate-lessons-migration.mjs';

const lessons = collectLessons();

/**
 * Parses one generated INSERT back into a row object, independently of the
 * code that wrote it. Catches SQL-literal escaping bugs (quotes, backslashes,
 * newlines) that would otherwise only surface at `db push` time.
 */
function parseInsert(statement) {
  const colsMatch = statement.match(/^INSERT INTO lessons \((.+)\)\nVALUES \((.+)\)\nON CONFLICT/s);
  if (!colsMatch) throw new Error('unexpected statement shape');

  const columns = colsMatch[1].split(', ').map((c) => c.replace(/"/g, ''));

  // Split on commas that are not inside a single-quoted literal.
  const values = [];
  let current = '';
  let inString = false;
  for (let i = 0; i < colsMatch[2].length; i++) {
    const ch = colsMatch[2][i];
    if (inString) {
      if (ch === "'" && colsMatch[2][i + 1] === "'") {
        current += "''";
        i++;
        continue;
      }
      if (ch === "'") inString = false;
      current += ch;
      continue;
    }
    if (ch === "'") {
      inString = true;
      current += ch;
      continue;
    }
    if (ch === ',') {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  values.push(current.trim());

  expect(values).toHaveLength(columns.length);

  const row = {};
  columns.forEach((col, i) => {
    const raw = values[i];
    if (raw.endsWith('::jsonb')) {
      row[col] = JSON.parse(parseSqlLiteral(raw.slice(0, -'::jsonb'.length)));
    } else {
      row[col] = parseSqlLiteral(raw);
    }
  });
  return row;
}

describe('lessons migration generator', () => {
  it('finds every lesson seeder', () => {
    expect(lessons.length).toBe(109);
  });

  it('has no duplicate (subject, topic, subtopic)', () => {
    const keys = lessons.map((l) => `${l.subject}|${l.topic}|${l.subtopic}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('round-trips every lesson through SQL without corrupting data', () => {
    const corrupt = [];

    for (const lesson of lessons) {
      const row = parseInsert(toSql(lesson));
      for (const key of Object.keys(row)) {
        const original = lesson[key];
        const actual = row[key];
        const same = typeof original === 'object'
          ? JSON.stringify(original) === JSON.stringify(actual)
          : String(original) === actual;
        if (!same) corrupt.push(`${lesson.subject}/${lesson.topic} field "${key}"`);
      }
    }

    expect(corrupt).toEqual([]);
  });

  it('escapes apostrophes so Postgres cannot break the statement', () => {
    // A known apostrophe-bearing title from the corpus.
    const lesson = lessons.find((l) => /[a-z]'[a-z]/i.test(l.title) || /'/.test(JSON.stringify(l.content_sections)));
    expect(lesson, 'expected at least one lesson containing an apostrophe').toBeTruthy();

    const statement = toSql(lesson);
    expect(() => parseInsert(statement)).not.toThrow();
    // Doubling is the only legal escape; a backslash would be literal in Postgres.
    expect(statement).not.toMatch(/\\'/);
  });

  it('keeps every generated row published so the anon SELECT policy exposes it', () => {
    for (const lesson of lessons) {
      expect(lesson.status).toBe('published');
    }
  });

  it('writes the committed migration up to date', () => {
    // Guards against editing the generated SQL by hand or changing a seeder
    // without re-running the generator.
    expect(readFileSync(OUT, 'utf8')).toBe(buildMigration(lessons));
  });

  it('emits one upsert per lesson against the unique index', () => {
    const sql = readFileSync(OUT, 'utf8');
    expect(sql.match(/^INSERT INTO lessons/gm)).toHaveLength(lessons.length);
    expect(sql.match(/ON CONFLICT \(subject, topic, subtopic\) DO UPDATE/g)).toHaveLength(
      lessons.length
    );
  });

  it('lets the column DEFAULT apply for seeders that omit practice questions', () => {
    const without = lessons.filter((l) => !('practice_questions' in l));
    expect(without.length).toBeGreaterThan(0);
    for (const lesson of without) {
      expect(toSql(lesson)).not.toContain('"practice_questions"');
    }
  });
});

/**
 * Generates supabase/migrations/<ts>_seed_lessons.sql from the Deno lesson
 * seeders in supabase/seed-scripts/*.
 *
 * The seeders are edge functions that were never deployed (see
 * supabase/seed-scripts/README.md), so their content had no path into the
 * database. This folds their content into one idempotent migration that
 * `supabase db push` applies alongside the table creation.
 *
 * Usage: node scripts/generate-lessons-migration.mjs
 */
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SEED_DIR = join(ROOT, 'supabase', 'seed-scripts');
export const OUT = join(
  ROOT,
  'supabase',
  'migrations',
  '20260812000000_seed_lessons.sql'
);

/** Only these seeders carry lesson content. */
const LESSON_SEEDERS = /^(seed-.*-lessons|seed-physics-batch\d|seed-coulomb-lesson)$/;

/**
 * Must be present in every seeder — `content_sections` is NOT NULL in the
 * schema, and the rest have no meaningful default.
 */
const REQUIRED = [
  'subject',
  'topic',
  'subtopic',
  'title',
  'learning_objectives',
  'difficulty_level',
  'estimated_minutes',
  'content_sections',
  'status',
];

/**
 * Written only when the seeder supplies them, so the column DEFAULT from
 * 20260811000000_create_lessons_table.sql applies otherwise. The biology and
 * chemistry seeders ship no practice_questions/mastery_criteria.
 */
const OPTIONAL = ['practice_questions', 'mastery_criteria', 'version'];

const JSONB_COLUMNS = new Set([
  'learning_objectives',
  'content_sections',
  'practice_questions',
  'mastery_criteria',
]);

/** Columns forming the conflict target; never reassigned on update. */
const CONFLICT_KEY = ['subject', 'topic', 'subtopic'];

/** Pulls the LESSONS array / COULOMB_LESSON object literal out of a seeder. */
export function extractLessons(source) {
  const arrayMatch = source.match(/const\s+LESSONS(?:\s*:\s*any\[\])?\s*=\s*(\[[\s\S]*?\n\]);/);
  if (arrayMatch) return JSON.parse(JSON.stringify(eval(`(${arrayMatch[1]})`)));

  const singleMatch = source.match(/const\s+COULOMB_LESSON\s*=\s*(\{[\s\S]*?\n\});/);
  if (singleMatch) return [JSON.parse(JSON.stringify(eval(`(${singleMatch[1]})`)))];

  throw new Error('no LESSONS array or COULOMB_LESSON object found');
}

/**
 * Reverses {@link sqlLiteral}. PostgreSQL unescapes `''` to `'` inside a
 * single-quoted string, so this is the inverse of the escaping above.
 */
export function parseSqlLiteral(raw) {
  if (!raw.startsWith("'") || !raw.endsWith("'")) {
    throw new Error(`not a quoted SQL literal: ${raw.slice(0, 40)}`);
  }
  return raw.slice(1, -1).replace(/''/g, "'");
}

const sqlLiteral = (value) => `'${String(value).replace(/'/g, "''")}'`;
const sqlJsonb = (value) => `${sqlLiteral(JSON.stringify(value))}::jsonb`;

export function toSql(lesson) {
  const columns = [...REQUIRED, ...OPTIONAL.filter((c) => c in lesson)];

  const cols = columns.map((c) => `"${c}"`).join(', ');
  const vals = columns
    .map((c) => (JSONB_COLUMNS.has(c) ? sqlJsonb(lesson[c]) : sqlLiteral(lesson[c])))
    .join(', ');

  const updates = columns
    .filter((c) => !CONFLICT_KEY.includes(c))
    .map((c) => `"${c}" = EXCLUDED."${c}"`)
    .join(', ');

  return `INSERT INTO lessons (${cols})
VALUES (${vals})
ON CONFLICT (${CONFLICT_KEY.join(', ')}) DO UPDATE SET
  ${updates},
  updated_at = now();`;
}

/** Reads every lesson seeder and returns the flattened lesson list. */
export function collectLessons() {
  const dirs = readdirSync(SEED_DIR).filter(
    (d) => LESSON_SEEDERS.test(d) && statSync(join(SEED_DIR, d)).isDirectory()
  );

  const lessons = [];
  const seen = new Map();

  for (const dir of dirs) {
    const found = extractLessons(readFileSync(join(SEED_DIR, dir, 'index.ts'), 'utf8'));

    for (const lesson of found) {
      for (const key of REQUIRED) {
        if (!(key in lesson)) {
          throw new Error(`${dir}: lesson "${lesson.topic}" missing "${key}"`);
        }
      }
      const dedupe = `${lesson.subject}|${lesson.topic}|${lesson.subtopic}`;
      if (seen.has(dedupe)) {
        throw new Error(
          `duplicate (subject,topic,subtopic) in ${dir} and ${seen.get(dedupe)}: ` +
            `${lesson.subject} | ${lesson.topic} | ${lesson.subtopic}`
        );
      }
      seen.set(dedupe, dir);
      lessons.push({ ...lesson, _source: dir });
    }
  }

  return lessons;
}

export function buildMigration(lessons) {
  const header = `-- Seed structured lessons (${lessons.length} rows).
--
-- GENERATED FILE - do not edit by hand.
-- Source: supabase/seed-scripts/*  (Deno edge-function seeders, never deployed)
-- Regenerate: node scripts/generate-lessons-migration.mjs
--
-- Idempotent: upserts on the (subject, topic, subtopic) unique index created in
-- 20260811000000_create_lessons_table.sql, so re-running is safe.

`;

  const body =
    lessons.map((l) => `-- ${l._source}: ${l.title}`).join('\n') +
    '\n\n' +
    lessons.map(toSql).join('\n\n') +
    '\n';

  return header + body;
}

function main() {
  const lessons = collectLessons();
  writeFileSync(OUT, buildMigration(lessons), 'utf8');

  const bySubject = {};
  for (const l of lessons) bySubject[l.subject] = (bySubject[l.subject] || 0) + 1;
  console.log(`wrote ${lessons.length} lessons -> ${OUT}`);
  for (const [s, n] of Object.entries(bySubject).sort()) {
    console.log(`  ${s.padEnd(22)} ${n}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

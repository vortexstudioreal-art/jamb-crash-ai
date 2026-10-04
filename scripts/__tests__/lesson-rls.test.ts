import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');
const migrationFiles = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));

/**
 * A policy with no `TO` clause is granted to every role, including anon. That
 * shipped once: `FOR ALL USING (true) WITH CHECK (true)` on lessons meant any
 * client holding only the public publishable key could rewrite every lesson.
 */
function parsePolicies(sql) {
  const stripped = sql.replace(/--.*$/gm, '');
  // `USING (...)` needs one level of nesting allowed, otherwise auth.email()
  // truncates the capture at its own closing paren.
  const re = /CREATE\s+POLICY\s+(?:IF\s+NOT\s+EXISTS\s+)?"?([^"]+?)"?\s+ON\s+([\w.]+)\s+FOR\s+(\w+)\s*(?:TO\s+([^;]+?)\s+)?USING\s*\(((?:[^()]|\([^()]*\))*)\)([^;]*);/gi;

  const found = [];
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const roles = m[4] ? m[4].split(',').map((r) => r.trim().toLowerCase()) : null;
    found.push({
      name: m[1],
      table: m[2],
      command: m[3].toUpperCase(),
      roles,
      using: m[5].trim(),
      withCheck: (m[6] || '').includes('WITH CHECK') ? m[6].trim() : null,
    });
  }
  return found;
}

const isWrite = (p) => ['ALL', 'INSERT', 'UPDATE', 'DELETE'].includes(p.command);
const isClientRole = (p) => p.roles === null || p.roles.includes('anon') || p.roles.includes('authenticated');

describe('lesson RLS policies', () => {
  const policies = migrationFiles
    .filter((f) => /lesson|row_level_security/i.test(f))
    .flatMap((file) => parsePolicies(readFileSync(join(MIGRATIONS_DIR, file), 'utf8')).map((p) => ({ ...p, file })));

  it('finds policies to check', () => {
    expect(policies.length).toBeGreaterThan(0);
  });

  it('never leaves a write policy unscoped to a role', () => {
    const unscoped = policies
      .filter((p) => isWrite(p) && p.roles === null)
      .map((p) => `${p.file}: ${p.name}`);

    expect(unscoped).toEqual([]);
  });

  it('never lets a client write lesson content', () => {
    const offenders = policies
      .filter((p) => isWrite(p) && p.table.endsWith('lessons') && isClientRole(p))
      .map((p) => `${p.file}: ${p.name} [${p.command}] roles=${p.roles}`);

    expect(offenders).toEqual([]);
  });

  it('never grants anon any write', () => {
    const offenders = policies
      .filter((p) => isWrite(p) && p.roles !== null && p.roles.includes('anon'))
      .map((p) => `${p.file}: ${p.name}`);

    expect(offenders).toEqual([]);
  });

  it('only lets authenticated users write progress, scoped to their own row', () => {
    const clientProgressWrites = policies.filter((p) => isWrite(p) && p.table.endsWith('lesson_progress') && isClientRole(p));

    expect(clientProgressWrites.length).toBeGreaterThan(0);

    const unsafe = clientProgressWrites
      .filter((p) => p.roles === null || !p.roles.includes('authenticated') || p.roles.includes('anon'))
      .map((p) => `${p.file}: ${p.name} roles=${p.roles}`);

    expect(unsafe).toEqual([]);

    for (const p of clientProgressWrites) {
      expect(p.using, `${p.file}: ${p.name}`).toMatch(/auth\.email\(\)\s*=/);
    }
  });

  it('enables row level security on both lesson tables', () => {
    const sql = migrationFiles
      .filter((f) => /lesson|row_level_security/i.test(f))
      .map((f) => readFileSync(join(MIGRATIONS_DIR, f), 'utf8'))
      .join('\n');

    expect(sql).toMatch(/ALTER\s+TABLE\s+(public\.)?lessons\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i);
    expect(sql).toMatch(/ALTER\s+TABLE\s+(public\.)?lesson_progress\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i);
  });
});

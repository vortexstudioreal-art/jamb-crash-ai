import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://pjdgzqnyyobtiwplatni.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const SEED_DIR = join(process.cwd(), 'supabase', 'seed-scripts');

const VALID_SUBJECTS = [
  'english','mathematics','physics','chemistry','biology',
  'literature','government','economics','crs','irs',
  'geography','accounting','commerce','agricultural_science'
];

function extractQuestionsFromFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const results = [];

  // Find subject sections: either "subject_name": [ or subject: "subject_name"
  // Build a map of character positions to subjects
  const subjectPositions = [];

  // Pattern 1: Object key style — english: [  or  "english": [
  const keyRegex = /['"]?(\w+)['"]?\s*:\s*\[/g;
  let m;
  while ((m = keyRegex.exec(raw)) !== null) {
    const name = m[1].toLowerCase();
    if (VALID_SUBJECTS.includes(name)) {
      subjectPositions.push({ name, index: m.index });
    }
  }

  // Pattern 2: subject: 'english' inline
  const inlineRegex = /subject:\s*['"](\w+)['"]/g;
  while ((m = inlineRegex.exec(raw)) !== null) {
    const name = m[1].toLowerCase();
    if (VALID_SUBJECTS.includes(name)) {
      subjectPositions.push({ name, index: m.index });
    }
  }

  subjectPositions.sort((a, b) => a.index - b.index);

  // Extract all question objects
  const qRegex = /\{\s*question:\s*["'`](.+?)["'`]\s*,\s*option_a:\s*["'`](.+?)["'`]\s*,\s*option_b:\s*["'`](.+?)["'`]\s*,\s*option_c:\s*["'`](.+?)["'`]\s*,\s*option_d:\s*["'`](.+?)["'`]\s*,\s*correct_answer:\s*["'`](.+?)["'`]\s*,\s*explanation:\s*["'`](.+?)["'`](?:\s*,\s*year:\s*(\d+))?\s*\}/gs;

  let qm;
  while ((qm = qRegex.exec(raw)) !== null) {
    // Find nearest preceding subject
    let subject = 'unknown';
    for (let i = subjectPositions.length - 1; i >= 0; i--) {
      if (subjectPositions[i].index < qm.index) {
        subject = subjectPositions[i].name;
        break;
      }
    }
    if (subject === 'unknown') continue;

    results.push({
      subject,
      question: unescape(qm[1]),
      option_a: unescape(qm[2]),
      option_b: unescape(qm[3]),
      option_c: unescape(qm[4]),
      option_d: unescape(qm[5]),
      correct_answer: qm[6],
      explanation: unescape(qm[7]),
      year: qm[8] ? parseInt(qm[8]) : 2025,
    });
  }

  return results;
}

function unescape(s) {
  return s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

async function seed() {
  const seedDirs = readdirSync(SEED_DIR).filter(d => {
    try {
      const stat = readFileSync(join(SEED_DIR, d, 'index.ts'), 'utf-8');
      return stat.includes('question:');
    } catch { return false; }
  });

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const dir of seedDirs) {
    const filePath = join(SEED_DIR, dir, 'index.ts');
    const questions = extractQuestionsFromFile(filePath);
    if (questions.length === 0) continue;

    console.log(`\n📦 ${dir}: ${questions.length} questions found`);

    let inserted = 0;
    let skipped = 0;

    // Batch insert in groups of 50
    for (let i = 0; i < questions.length; i += 50) {
      const batch = questions.slice(i, i + 50);
      const { data: existing } = await supabase
        .from('jamb_questions')
        .select('question, subject')
        .in('question', batch.map(q => q.question));

      const existingSet = new Set(
        (existing || []).map(e => `${e.question}|||${e.subject}`)
      );

      const newQuestions = batch.filter(
        q => !existingSet.has(`${q.question}|||${q.subject}`)
      );

      if (newQuestions.length === 0) {
        skipped += batch.length;
        continue;
      }

      const { error } = await supabase
        .from('jamb_questions')
        .insert(newQuestions);

      if (error) {
        console.error(`   ❌ Error inserting batch: ${error.message}`);
        skipped += batch.length;
      } else {
        inserted += newQuestions.length;
        skipped += batch.length - newQuestions.length;
      }
    }

    console.log(`   ✅ ${inserted} inserted, ⏭️ ${skipped} skipped (duplicates)`);
    totalInserted += inserted;
    totalSkipped += skipped;
  }

  const { count } = await supabase
    .from('jamb_questions')
    .select('*', { count: 'exact', head: true });

  console.log(`\n═══════════════════════════════════════`);
  console.log(`🎉 DONE! Total inserted: ${totalInserted}`);
  console.log(`⏭️ Total skipped: ${totalSkipped}`);
  console.log(`📊 Total in database: ${count}`);
  console.log(`═══════════════════════════════════════`);
}

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

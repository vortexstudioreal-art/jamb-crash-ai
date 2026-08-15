import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL="(.+)"/)[1];
const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.+)"/)[1];
const supabase = createClient(url, key);

const subjects = ['mathematics','physics','chemistry','biology','literature','government','economics','geography','accounting','commerce','crs','irs','agricultural_science'];
const batches = 10;
const perBatch = 50;
let totalI = 160;
let totalG = 227;

for (const subj of subjects) {
  let inserted = 0;
  let generated = 0;
  for (let b = 1; b <= batches; b++) {
    let success = false;
    for (let retry = 0; retry < 5 && !success; retry++) {
      try {
        const { data, error } = await supabase.functions.invoke('seed-10000-questions', {
          body: { subject: subj, count: perBatch }
        });
        if (error) throw new Error(error.message);
        inserted += data.inserted || 0;
        generated += data.generated || 0;
        totalI += data.inserted || 0;
        totalG += data.generated || 0;
        success = true;
        process.stdout.write(`\r${subj} ${b}/${batches} [try ${retry+1}]: +${data.inserted||0} (total: ${totalI})        `);
      } catch (e) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    if (!success) process.stdout.write(`\r${subj} ${b}/${batches}: FAILED after 5 retries        `);
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`\n${subj}: ${inserted}/${generated} inserted`);
}

console.log(`\nDONE! Total: ${totalI} inserted / ${totalG} generated`);

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL="(.+)"/)[1];
const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.+)"/)[1];

const supabase = createClient(url, key);

const subjects = ['english','mathematics','physics','chemistry','biology','literature','government','economics','geography','accounting','commerce','crs','irs','agricultural_science'];
const batches = 10;
const perBatch = 50;
let totalI = 0;
let totalG = 0;

for (const subj of subjects) {
  let inserted = 0;
  let generated = 0;
  for (let b = 1; b <= batches; b++) {
    const { data, error } = await supabase.functions.invoke('seed-10000-questions', {
      body: { subject: subj, count: perBatch }
    });
    if (data) {
      inserted += data.inserted || 0;
      generated += data.generated || 0;
      totalI += data.inserted || 0;
      totalG += data.generated || 0;
    }
    if (error) console.error(`${subj} batch ${b}: ${error.message}`);
    process.stdout.write(`\r${subj} ${b}/${batches}: +${data?.inserted||0} (total: ${totalI})         `);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n${subj}: ${inserted}/${generated} inserted`);
}

console.log(`\nDONE! Total: ${totalI} inserted / ${totalG} generated`);

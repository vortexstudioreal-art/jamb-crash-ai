import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL="(.+)"/)[1];
const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.+)"/)[1];

const supabase = createClient(url, key);

const subject = process.argv[2] || 'english';
const count = parseInt(process.argv[3]) || 50;

const { data, error } = await supabase.functions.invoke('seed-10000-questions', {
  body: { subject, count }
});

if (error) {
  console.error('Error:', error.message);
} else {
  console.log(JSON.stringify(data, null, 2));
}

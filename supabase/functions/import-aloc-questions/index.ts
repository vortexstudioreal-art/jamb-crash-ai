import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Open ALOC question bank dump (real UTME/WASSCE/Post-UTME questions).
const DUMP_URL =
  "https://raw.githubusercontent.com/dmaximboi/aloc-jamb/master/storage/backups/2020-08-20.sql";

// ALOC table -> jamb_subject enum
const TABLE_MAP: Record<string, string> = {
  english: "english",
  mathematics: "mathematics",
  physics: "physics",
  chemistry: "chemistry",
  biology: "biology",
  englishlit: "literature",
  government: "government",
  economics: "economics",
  geography: "geography",
  accounting: "accounting",
  commerce: "commerce",
  crk: "crs",
  irk: "irs",
};

interface Parsed {
  subject: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  year: number | null;
}

// Split top-level "),( " row separators, respecting quoted strings.
function splitRows(body: string): string[] {
  const rows: string[] = [];
  let cur = "", inStr = false, esc = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      cur += ch;
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === "'") inStr = false;
    } else {
      if (ch === "'") { inStr = true; cur += ch; }
      else if (ch === ")" && body[i + 1] === "," && body[i + 2] === "(") {
        rows.push(cur); cur = ""; i += 2;
      } else cur += ch;
    }
  }
  rows.push(cur);
  return rows;
}

function splitCols(row: string): string[] {
  const cols: string[] = [];
  let cur = "", inStr = false, esc = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (inStr) {
      cur += ch;
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === "'") inStr = false;
    } else {
      if (ch === "'") { inStr = true; cur += ch; }
      else if (ch === ",") { cols.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
  }
  cols.push(cur.trim());
  return cols;
}

function unescapeMySQL(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) {
      const n = s[i + 1];
      if (n === "n") out += "\n";
      else if (n === "r") out += "\r";
      else if (n === "t") out += "\t";
      else if (n === "0") out += "\0";
      else out += n;
      i++;
    } else out += s[i];
  }
  return out;
}

function cell(raw: string): string | null {
  const t = raw.trim();
  if (t === "NULL" || t === "") return null;
  if (t.startsWith("'") && t.endsWith("'") && t.length >= 2) {
    return unescapeMySQL(t.slice(1, -1));
  }
  return unescapeMySQL(t);
}

const normalize = (q: string) =>
  q.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

// Imported banks carry markup (<i>, &nbsp;) — strip before storing so it
// never renders raw in quiz cards.
const stripHtml = (s: string): string =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();

async function doImport(supabase: ReturnType<typeof createClient>) {
  console.log("[import-aloc] downloading dump…");
  const res = await fetch(DUMP_URL);
  if (!res.ok) throw new Error(`dump download failed: ${res.status}`);
  const sql = await res.text();
  console.log(`[import-aloc] dump size: ${sql.length} chars`);

  // Existing questions for dedupe
  const seen = new Set<string>();
  let page = 0;
  const pageSize = 1000;
  for (;;) {
    const { data, error } = await supabase
      .from("jamb_questions")
      .select("question, subject")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data as { question: string; subject: string }[]) {
      seen.add(`${r.subject}::${normalize(r.question)}`);
    }
    if (data.length < pageSize) break;
    page++;
  }
  console.log(`[import-aloc] existing in DB: ${seen.size}`);

  const fresh: Parsed[] = [];
  const perSubject: Record<string, number> = {};

  for (const [table, subject] of Object.entries(TABLE_MAP)) {
    const m = sql.match(new RegExp(`INSERT INTO \`${table}\` VALUES \\((.*?)\\)\\s*;`, "s"));
    if (!m) continue;
    const rows = splitRows(m[1]);
    for (const row of rows) {
      const c = splitCols(row);
      if (c.length < 12) continue;
      // cols: id, question, A, B, C, D, section, image, answer, solution, examtype, examyear, ...
      if ((cell(c[10]) || "").toLowerCase() !== "utme") continue;
      const ans = (cell(c[8]) || "").trim().toLowerCase();
      if (!/^[a-d]$/.test(ans)) continue;
      const question = stripHtml(cell(c[1]) || "");
      if (!question) continue;
      // Reject dangling references: empty targets ("…syllable:") and
      // missing words ("…spell the word"). Unfixable rows are pruned,
      // never imported.
      if (/: *$/.test(question) && question.length < 120) {
        const tail = question.slice(-60);
        if (!/[A-Z]{3,}/.test(tail) && !/["']/.test(tail)) continue;
      }
      if (/spell the word\s*$/i.test(question)) continue;
      const opts = [cell(c[2]), cell(c[3]), cell(c[4]), cell(c[5])].map((o) => stripHtml(o || ""));
      if (opts.some((o) => !o)) continue;
      const yearRaw = (cell(c[11]) || "").trim();
      const yearNum = parseInt(yearRaw, 10);
      const year = /^\d{4}$/.test(yearRaw) && yearNum >= 1978 && yearNum <= 2026 ? yearNum : null;
      const key = `${subject}::${normalize(question)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const solution = stripHtml(cell(c[9]) || "");
      fresh.push({
        subject,
        question,
        option_a: opts[0],
        option_b: opts[1],
        option_c: opts[2],
        option_d: opts[3],
        correct_answer: ans.toUpperCase(),
        explanation: solution || null,
        year,
      });
      perSubject[subject] = (perSubject[subject] || 0) + 1;
    }
  }

  console.log(`[import-aloc] new UTME questions: ${fresh.length}`, perSubject);

  let inserted = 0;
  for (let i = 0; i < fresh.length; i += 200) {
    const batch = fresh.slice(i, i + 200);
    const { error } = await supabase.from("jamb_questions").insert(batch);
    if (error) {
      console.error("[import-aloc] batch insert error:", error.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`[import-aloc] done. inserted=${inserted}`);
  return { inserted, perSubject };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Owner/admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const { data: isAdmin } = await supabase.rpc("is_admin_or_owner", {
      _user_id: user.id,
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Long import runs in the background; re-invoking is safe (dedupes).
    // @ts-expect-error EdgeRuntime is available in Deno deploy
    EdgeRuntime.waitUntil(
      doImport(supabase).catch((e) => console.error("[import-aloc] fatal:", e))
    );
    return new Response(JSON.stringify({ status: "started" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("import-aloc-questions error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Scraped (questions + answer letters only — never their explanations)
// committed in this repo so the import is reviewable and repeatable.
const FILES = [
  "https://raw.githubusercontent.com/vortexstudioreal-art/jamb-crash-ai/main/supabase/seed-data/afro-physics.json",
  "https://raw.githubusercontent.com/vortexstudioreal-art/jamb-crash-ai/main/supabase/seed-data/afro-mathematics.json",
];

interface Scraped {
  subject: string;
  year: number;
  question: string;
  options: string[];
  correct_answer: string;
}

const normalize = (q: string) =>
  q.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

// Imported banks carry markup (<i>, &nbsp;) — strip before storing so it
// never renders raw in quiz cards.
const stripHtml = (s: string): string =>
  s
    .replace(/<\/?[a-zA-Z][^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();

const clean = (q: Scraped): boolean => {
  if (!q.question?.trim() || q.options?.length !== 4) return false;
  if (q.options.some((o) => !o?.trim())) return false;
  if (!/^[a-dA-D]$/.test((q.correct_answer || "").trim())) return false;
  // Drop rows with leftover markup/entities the scraper couldn't decode.
  // Tag-only check: bare "<" in "x < 5" is legitimate maths, not markup.
  if (/<\/?[a-zA-Z]/.test(q.question) || q.options.some((o) => /<\/?[a-zA-Z]/.test(o))) return false;
  if (/&(nbsp|amp|lt|gt|quot);/.test(q.question)) return false;
  // Drop dangling references (empty targets, missing words)
  if (/: *$/.test(q.question) && q.question.length < 80) {
    const tail = q.question.slice(-60);
    if (!/[A-Z]{3,}/.test(tail) && !/["']/.test(tail) && !/\b(which|who|what|whom|whose)\b/i.test(tail)) return false;
  }
  if (/spell the word\s*$/i.test(q.question)) return false;
  if (typeof q.year !== "number" || q.year < 1978 || q.year > 2026) return false;
  return true;
};

async function doImport(supabase: ReturnType<typeof createClient>) {
  const seen = new Set<string>();
  let page = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("jamb_questions")
      .select("question, subject")
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data as { question: string; subject: string }[]) {
      seen.add(`${r.subject}::${normalize(r.question)}`);
    }
    if (data.length < 1000) break;
    page++;
  }

  let fetched = 0, inserted = 0;
  const perSubject: Record<string, number> = {};
  for (const url of FILES) {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[import-scraped] download failed ${url}: ${res.status}`);
      continue;
    }
    const rows = (await res.json()) as Scraped[];
    const fresh = [];
    for (const q of rows) {
      fetched++;
      if (!clean(q)) continue;
      const subject = q.subject.toLowerCase();
      const question = stripHtml(q.question);
      const options = q.options.map((o) => stripHtml(o));
      if (!question || options.some((o) => !o)) continue;
      const key = `${subject}::${normalize(question)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      fresh.push({
        subject,
        question,
        option_a: options[0],
        option_b: options[1],
        option_c: options[2],
        option_d: options[3],
        correct_answer: q.correct_answer.trim().toUpperCase(),
        explanation: null,
        topics: null,
        year: q.year,
        is_ai_generated: false,
      });
      perSubject[subject] = (perSubject[subject] || 0) + 1;
    }
    for (let i = 0; i < fresh.length; i += 200) {
      const { error } = await supabase.from("jamb_questions").insert(fresh.slice(i, i + 200));
      if (error) console.error("[import-scraped] batch error:", error.message);
      else inserted += Math.min(200, fresh.length - i);
    }
  }
  console.log(`[import-scraped] fetched=${fetched} inserted=${inserted}`, perSubject);
  return { fetched, inserted, perSubject };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // @ts-expect-error EdgeRuntime is available in Deno deploy
    EdgeRuntime.waitUntil(
      doImport(supabase).catch((e) => console.error("[import-scraped] fatal:", e))
    );
    return new Response(JSON.stringify({ status: "started" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("import-scraped-questions error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

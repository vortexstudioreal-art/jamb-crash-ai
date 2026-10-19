import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// One admin press = one Groq call for up to N explanations. Small, idempotent
// and resumable: rows that already have explanations are never touched, so
// the button can be pressed a few times a day until `remaining` hits zero
// without any quota babysitting.

interface ExplRow {
  n: number;
  explanation: string;
}

// Control characters (raw newlines from multi-line maths working, tabs)
// are illegal inside JSON strings. Built from char codes so no fragile
// escape sequences can be corrupted in transit.
const CONTROL_CHARS = new RegExp(
  "[" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + "]",
  "g"
);

// Lone backslashes (LaTeX \frac, \Delta) are illegal JSON escapes.
// Escape only those; valid escapes (\n, \u00b0, ...) pass through untouched.
function sanitizeJson(s: string): string {
  return s.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
}

function tryParseItem(raw: string): ExplRow | null {
  try {
    return JSON.parse(sanitizeJson(raw)) as ExplRow;
  } catch {
    // ignore, try neutralized below
  }
  try {
    return JSON.parse(sanitizeJson(raw).replace(CONTROL_CHARS, " ")) as ExplRow;
  } catch {
    return null;
  }
}

function extractJsonArray(text: string): ExplRow[] {
  const cleaned = text.replace(/```json|```/g, "");
  // Fast path: the whole array parses.
  const m = cleaned.match(/\[[\s\S]*\]/);
  if (m) {
    try {
      const arr = JSON.parse(sanitizeJson(m[0]));
      if (Array.isArray(arr)) return arr;
    } catch {
      // Fall through to per-item recovery below.
    }
  }
  // Recovery: parse each {...} separately so one corrupt item (raw
  // newlines, stray prose) can't void the other 14.
  const out: ExplRow[] = [];
  const itemRe = /\{[^{}]*\}/g;
  let im: RegExpExecArray | null;
  while ((im = itemRe.exec(cleaned)) !== null) {
    const item = tryParseItem(im[0]);
    if (item) out.push(item);
  }
  return out;
}

function validExplanation(e: string): boolean {
  const t = (e || "").trim();
  // Floor raised from 20 to 50. Short explanations were being stored that just
  // restated the answer ("This is an idiom expressing jealousy") instead of
  // teaching the reasoning. A rejected row is not lost - it stays null and is
  // picked up by a later pass.
  if (t.length < 50 || t.length > 1200) return false;
  // Maths/science need < > (inequalities, formulas). They render as plain
  // text downstream (stripQuestionHtml / escaped markdown), so only
  // backticks — which corrupt markdown code spans — are rejected.
  if (/`/.test(t)) return false;
  // A single short clause with no full stop is a label, not an explanation.
  const sentences = t.split(/[.!?]/).filter((s) => s.trim().length > 0);
  if (sentences.length < 2) return false;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) throw new Error("GROQ_API_KEY not configured");

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

    const body = await req.json().catch(() => ({}));
    const subject = (body.subject || "").toLowerCase() || null;
    const limit = Math.min(Math.max(parseInt(body.limit) || 10, 1), 15);

    let query = supabase
      .from("jamb_questions")
      .select("id, question, option_a, option_b, option_c, option_d, correct_answer, subject")
      .is("explanation", null)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (subject) query = query.eq("subject", subject);
    const { data: rows, error: qError } = await query;
    if (qError) throw qError;

    const { count: remaining } = await supabase
      .from("jamb_questions")
      .select("id", { count: "exact", head: true })
      .is("explanation", null);

    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ updated: 0, attempted: 0, remaining: remaining ?? 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const numbered = rows
      .map(
        (r, i) =>
          `${i + 1}. [${r.subject}] ${(r.question || "").trim()} (A) ${(r.option_a || "").trim()} (B) ${(r.option_b || "").trim()} (C) ${(r.option_c || "").trim()} (D) ${(r.option_d || "").trim()} Correct: ${(r.correct_answer || "").trim().toUpperCase()}`
      )
      .join("\n");

    const prompt = `Write a short explanation for each JAMB UTME multiple-choice question below.

Rules:
- 2-3 plain sentences, always at least 2. Minimum 60 characters.
- TEACH, do not restate the answer. Never write "This is an idiom expressing jealousy" or "The answer is X" - instead give the reasoning a student can reuse on the next question. Name the rule, principle, or definition being tested, and say briefly why the tempting wrong options fail when they are genuinely tempting.
- For calculation subjects show the key working and the final answer.
- Plain text only. No markdown, no HTML, no bullet points, no quotes around the whole text.

Examples of the difference:
  Weak: "This is an idiom expressing jealousy."
  Good: "Green with envy is an idiom, not a literal description. Figurative idioms describe a state through a literal image, so 'green' signals jealousy while 'with envy' names the emotion directly."

${numbered}

Return ONLY a valid JSON array, no other text. Each item exactly: {"n": <question number>, "explanation": "..."}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: "You are a JAMB teacher writing concise answer explanations. You output only valid JSON arrays." },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.2,
      }),
    });
    if (!res.ok) {
      const retryAfter = res.headers.get("retry-after");
      return new Response(
        JSON.stringify({
          updated: 0,
          attempted: rows.length,
          remaining: remaining ?? 0,
          error: res.status === 429 ? `Rate limited${retryAfter ? `, retry after ${retryAfter}s` : ""}. Try again later.` : `Groq error ${res.status}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const parsed = extractJsonArray(text);

    let updated = 0;
    let rejected = 0;
    for (const item of parsed) {
      const idx = (item.n || 0) - 1;
      if (idx < 0 || idx >= rows.length) continue;
      const expl = (item.explanation || "").trim();
      if (!validExplanation(expl)) {
        rejected++;
        continue;
      }
      // Only fill still-empty rows — never overwrite (race-safe).
      const { data: upd, error } = await supabase
        .from("jamb_questions")
        .update({ explanation: expl })
        .eq("id", rows[idx].id)
        .is("explanation", null)
        .select("id");
      if (!error && upd && upd.length > 0) updated++;
    }

    // NOTE: updates are verified per-row via .select("id") above.
    return new Response(
      JSON.stringify({ updated, attempted: rows.length, parsed: parsed.length, rejected, remaining: remaining ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("backfill-explanations error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

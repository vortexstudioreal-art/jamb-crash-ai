import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BATCH_SIZE = 10;

interface GenQ {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  topic: string;
  diagram?: string;
}

// Subjects where a figure genuinely helps (circuits, geometry, charts).
const DIAGRAM_SUBJECTS = ["physics", "mathematics", "chemistry", "commerce", "economics"];

const normalize = (q: string) =>
  q.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

function validQ(q: GenQ): boolean {
  if (!q.question?.trim()) return false;
  if (![q.option_a, q.option_b, q.option_c, q.option_d].every((o) => o?.trim())) return false;
  if (!/^[a-dA-D]$/.test((q.correct_answer || "").trim())) return false;
  if (!q.explanation?.trim()) return false;
  // Backticks corrupt markdown rendering downstream; < > are legitimate in
  // maths/science stems (inequalities, formulas) and render as plain text.
  if (/`/.test(q.question)) return false;
  if (/: *$/.test(q.question.trim())) return false;
  if (/spell the word\s*$/i.test(q.question)) return false;
  if (!/[\s:]/.test(q.question.trim())) {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
    const opts = [q.option_a, q.option_b, q.option_c, q.option_d];
    if (!opts.some((o) => norm(o) === norm(q.question))) return false;
  }
  // Diagrams are optional but must be safe, self-contained inline SVG.
  if (q.diagram !== undefined && q.diagram !== null && q.diagram !== "") {
    const d = q.diagram.trim();
    if (!/^<svg[\s>]/i.test(d)) return false;
    if (d.length > 6000) return false;
    if (/<script/i.test(d)) return false;
    if (/\son\w+\s*=/i.test(d)) return false;
  }
  return true;
}

// The model wraps physics symbols in backticks (`g`, `m/s`) despite the
// no-markup rule. They render as literal ticks downstream, so strip them
// here instead of voiding the question (validQ keeps rejecting strays as
// a second net).
const stripTicks = (s: string) => (s || "").replace(/`/g, "").trim();

interface BatchResult {
  items: GenQ[];
  http: number;
  parsed: number;
  retryAfter: number;
  bodySnippet: string;
}

const CONTROL_CHARS = new RegExp(
  "[" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + "]",
  "g"
);

function tryParseQuestion(raw: string): GenQ | null {
  try {
    return JSON.parse(sanitizeJson(raw)) as GenQ;
  } catch {
    // ignore, try neutralized below
  }
  try {
    return JSON.parse(sanitizeJson(raw).replace(CONTROL_CHARS, " ")) as GenQ;
  } catch {
    return null;
  }
}

function extractJsonArrayRaw(text: string): GenQ[] {
  const cleaned = text.replace(/```json|```/g, "");
  const m = cleaned.match(/\[[\s\S]*\]/);
  if (m) {
    try {
      const arr = JSON.parse(sanitizeJson(m[0]));
      if (Array.isArray(arr)) return arr;
    } catch {
      // Fall through to per-item recovery below.
    }
  }
  // Recovery: one corrupt item (LaTeX backslashes, raw newlines from
  // multi-line working) must not void the other nine.
  const out: GenQ[] = [];
  const itemRe = /\{[^{}]*\}/g;
  let im: RegExpExecArray | null;
  while ((im = itemRe.exec(cleaned)) !== null) {
    const item = tryParseQuestion(im[0]);
    if (item) out.push(item);
  }
  return out;
}

// Science answers come back with LaTeX (\\frac, \\vec, \\Delta). A lone
// backslash is an illegal JSON escape and kills the whole parse — so the
// entire batch scores zero. Escape only the illegal ones; valid escapes
// (\\n, \\u00b0, ...) pass through untouched.
function sanitizeJson(s: string): string {
  return s.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
}

async function genBatch(
  apiKey: string,
  subject: string,
  topicHint: string,
  avoid: string[],
  balanceNote: string
): Promise<GenQ[]> {
  const topicLine = topicHint
    ? `Focus this batch on the sub-topic "${topicHint}".`
    : `Spread questions across the full ${subject} JAMB syllabus (vary sub-topics).`;
  const prompt = `Generate ${BATCH_SIZE} original JAMB UTME-style multiple choice practice questions for ${subject} (Nigerian syllabus).
${topicLine}
These are "likely questions" for practice — in the style and difficulty of real JAMB questions, but newly written. Do NOT copy known past questions verbatim.
Avoid repeating these already-covered questions: ${avoid.slice(0, 20).join(" || ").substring(0, 800) || "none"}.
RULES: every question must be fully self-contained — never end a question with a bare colon, never reference a missing passage/word ("the word" must appear with the word), never use markdown or HTML markup. A one-word question is only allowed when the options are stress-marked variants of that same word.
STYLE (this is what makes them indistinguishable from real JAMB):
- State the problem directly. Use "Which of the following" at most twice per batch.
- Keep the four options parallel in form and similar in length; the correct option must not stand out by length or specificity.
- Distribute the correct answers across A, B, C and D as evenly as possible within the batch — never cluster on one letter.${balanceNote}
- Numbers carry units with a space (e.g. "4 m", "100 W"); use Nigerian contexts (Naira, NEPA/PHCN grid, harmattan, local crops) where natural.
- Distractors must be plausible: common student errors, adjacent concepts, sign/unit slips — never joke options or obvious throwaways.

Return ONLY a valid JSON array, no other text. Each item exactly:
{"question": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "A|B|C|D", "explanation": "2-3 sentence reason the answer is correct", "topic": "short sub-topic name"${DIAGRAM_SUBJECTS.includes(subject) ? `, "diagram": "inline <svg> figure (viewBox 0 0 400 250, no scripts, no external refs, text 12px or larger) — REQUIRED on 2-4 questions in this batch where a figure helps (geometry figure, circuit, graph/chart drawn from the question's own numbers, data table); omit the key ONLY for purely verbal questions` : ""}}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are a JAMB exam setter. You output only valid JSON arrays." },
        { role: "user", content: prompt },
      ],
      max_tokens: 3000,
      temperature: 0.8,
    }),
  });
  if (!res.ok) {
    console.error(`[gen-batch] groq ${res.status}`);
    const retryAfter = parseInt(res.headers.get("retry-after") || "0", 10);
    const errBody = await res.text().catch(() => "");
    return { items: [], http: res.status, parsed: 0, retryAfter: isNaN(retryAfter) ? 0 : retryAfter, bodySnippet: errBody.slice(0, 300) };
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  const parsed = extractJsonArrayRaw(text);
  // Strip model backticks BEFORE validation so a `g` in one stem doesn't
  // void an otherwise good question (validQ keeps rejecting strays).
  const cleaned = parsed.map((q) => ({
    ...q,
    question: stripTicks(q.question),
    option_a: stripTicks(q.option_a),
    option_b: stripTicks(q.option_b),
    option_c: stripTicks(q.option_c),
    option_d: stripTicks(q.option_d),
    explanation: stripTicks(q.explanation),
  }));
  return { items: cleaned.filter(validQ), http: 200, parsed: parsed.length, retryAfter: 0, bodySnippet: "" };
}

async function doGenerate(
  supabase: ReturnType<typeof createClient>,
  apiKey: string,
  subject: string,
  count: number,
  topicHint: string
) {
  // Existing questions for dedupe (this subject)
  const seen = new Set<string>();
  let page = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("jamb_questions")
      .select("question")
      .eq("subject", subject)
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data as { question: string }[]) seen.add(normalize(r.question));
    if (data.length < 1000) break;
    page++;
  }

  let inserted = 0;
  let attempts = 0;
  let groqCalls = 0;
  let groqErrors = 0;
  let parsedTotal = 0;
  let freshTotal = 0;
  const maxAttempts = Math.ceil(count / BATCH_SIZE) + 3;

  // Answer-position balance: real JAMB spreads A-D roughly evenly, but the
  // model drifts (historically D-starved). Nudge each batch toward the
  // currently scarcest letters.
  const dist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  {
    let dpage = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("jamb_questions")
        .select("correct_answer")
        .eq("subject", subject)
        .eq("is_ai_generated", true)
        .range(dpage * 1000, (dpage + 1) * 1000 - 1);
      if (error || !data || data.length === 0) break;
      for (const r of data as { correct_answer: string }[]) {
        const k = (r.correct_answer || "").toUpperCase();
        if (dist[k] !== undefined) dist[k]++;
      }
      if (data.length < 1000) break;
      dpage++;
    }
  }
  const balanceNote = () => {
    const total = dist.A + dist.B + dist.C + dist.D;
    if (total < 20) return "";
    const avg = total / 4;
    const starved = (["A", "B", "C", "D"] as const).filter((k) => dist[k] < avg * 0.6);
    if (starved.length === 0) return "";
    return ` This subject's AI questions underuse ${starved.join(" and ")} — place several correct answers there.`;
  };

  // Groq errors (usually 429s) must not burn the attempt budget: back off
  // and try again. Bounded: the edge runtime kills long responses, so stop
  // waiting after ~100s and report partial progress with diagnostics.
  const t0 = Date.now();
  let errorStreak = 0;
  let firstError = "";
  const maxErrors = 12;
  while (inserted < count && attempts < maxAttempts && errorStreak < maxErrors) {
    const result = await genBatch(apiKey, subject, topicHint, [], balanceNote());
    groqCalls++;
    if (result.http !== 200) {
      groqErrors++;
      errorStreak++;
      if (!firstError) firstError = `${result.http}: ${result.bodySnippet}`;
      if (Date.now() - t0 > 100000) break;
      const waitMs = Math.min(30000, Math.max(15000, (result.retryAfter || 0) * 1000));
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    errorStreak = 0;
    attempts++;
    parsedTotal += result.parsed;
    const batch = result.items;
    if (batch.length === 0) {
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    const fresh = batch.filter((q) => {
      const key = normalize(q.question);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    freshTotal += fresh.length;
    if (fresh.length === 0) continue;
    const rows = fresh.map((q) => ({
      subject,
      question: stripTicks(q.question),
      option_a: stripTicks(q.option_a),
      option_b: stripTicks(q.option_b),
      option_c: stripTicks(q.option_c),
      option_d: stripTicks(q.option_d),
      correct_answer: q.correct_answer.trim().toUpperCase(),
      explanation: stripTicks(q.explanation),
      diagram_svg: q.diagram && q.diagram.trim() ? q.diagram.trim().slice(0, 6000) : null,
      topics: q.topic?.trim() ? [q.topic.trim()] : null,
      year: null,
      is_ai_generated: true,
    }));
    const { error } = await supabase.from("jamb_questions").insert(rows);
    if (error) {
      console.error("[gen-batch] insert error:", error.message);
    } else {
      inserted += rows.length;
      for (const r of rows) {
        const k = (r.correct_answer || "").toUpperCase();
        if (dist[k] !== undefined) dist[k]++;
      }
      console.log(`[gen-batch] ${subject}: +${rows.length} (total ${inserted})`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log(`[gen-batch] done ${subject}: inserted=${inserted}`);
  return { inserted, attempts, groqCalls, groqErrors, parsedTotal, freshTotal, firstError };
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

    const body = await req.json();
    const subject = (body.subject || "").toLowerCase();
    const count = Math.min(Math.max(parseInt(body.count) || 50, 10), 300);
    const topicHint = (body.topic || "").toString().slice(0, 80);
    if (!subject) {
      return new Response(JSON.stringify({ error: "subject required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Small batches run synchronously and report exactly what happened
    // (groq calls/errors, parsed/fresh/inserted) so silent zero-yield runs
    // are diagnosable in one tap. Large batches stay background.
    if (count <= 10) {
      const result = await doGenerate(supabase, apiKey, subject, count, topicHint);
      return new Response(JSON.stringify({ status: "done", subject, count, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // @ts-expect-error EdgeRuntime is available in Deno deploy
    EdgeRuntime.waitUntil(
      doGenerate(supabase, apiKey, subject, count, topicHint).catch((e) =>
        console.error("[gen-batch] fatal:", e)
      )
    );
    return new Response(JSON.stringify({ status: "started", subject, count }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-question-batch error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

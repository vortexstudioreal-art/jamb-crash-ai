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
}

const normalize = (q: string) =>
  q.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

function validQ(q: GenQ): boolean {
  if (!q.question?.trim()) return false;
  if (![q.option_a, q.option_b, q.option_c, q.option_d].every((o) => o?.trim())) return false;
  if (!/^[a-dA-D]$/.test((q.correct_answer || "").trim())) return false;
  if (!q.explanation?.trim()) return false;
  if (/[<>`]/.test(q.question)) return false;
  if (/: *$/.test(q.question.trim())) return false;
  if (/spell the word\s*$/i.test(q.question)) return false;
  if (!/[\s:]/.test(q.question.trim())) {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
    const opts = [q.option_a, q.option_b, q.option_c, q.option_d];
    if (!opts.some((o) => norm(o) === norm(q.question))) return false;
  }
  return true;
}

function extractJsonArray(text: string): GenQ[] {
  const cleaned = text.replace(/```json|```/g, "");
  const m = cleaned.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try {
    const arr = JSON.parse(m[0]);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function genBatch(
  apiKey: string,
  subject: string,
  topicHint: string,
  avoid: string[]
): Promise<GenQ[]> {
  const topicLine = topicHint
    ? `Focus this batch on the sub-topic "${topicHint}".`
    : `Spread questions across the full ${subject} JAMB syllabus (vary sub-topics).`;
  const prompt = `Generate ${BATCH_SIZE} original JAMB UTME-style multiple choice practice questions for ${subject} (Nigerian syllabus).
${topicLine}
These are "likely questions" for practice — in the style and difficulty of real JAMB questions, but newly written. Do NOT copy known past questions verbatim.
Avoid repeating these already-covered questions: ${avoid.slice(0, 20).join(" || ").substring(0, 800) || "none"}.
RULES: every question must be fully self-contained — never end a question with a bare colon, never reference a missing passage/word ("the word" must appear with the word), never use markdown or HTML markup. A one-word question is only allowed when the options are stress-marked variants of that same word.

Return ONLY a valid JSON array, no other text. Each item exactly:
{"question": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "A|B|C|D", "explanation": "2-3 sentence reason the answer is correct", "topic": "short sub-topic name"}`;

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
      max_tokens: 4096,
      temperature: 0.8,
    }),
  });
  if (!res.ok) {
    console.error(`[gen-batch] groq ${res.status}`);
    return [];
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return extractJsonArray(text).filter(validQ);
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
  const maxAttempts = Math.ceil(count / BATCH_SIZE) + 3;
  while (inserted < count && attempts < maxAttempts) {
    attempts++;
    const batch = await genBatch(apiKey, subject, topicHint, []);
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
    if (fresh.length === 0) continue;
    const rows = fresh.map((q) => ({
      subject,
      question: q.question.trim(),
      option_a: q.option_a.trim(),
      option_b: q.option_b.trim(),
      option_c: q.option_c.trim(),
      option_d: q.option_d.trim(),
      correct_answer: q.correct_answer.trim().toUpperCase(),
      explanation: q.explanation.trim(),
      topics: q.topic?.trim() ? [q.topic.trim()] : null,
      year: null,
      is_ai_generated: true,
    }));
    const { error } = await supabase.from("jamb_questions").insert(rows);
    if (error) {
      console.error("[gen-batch] insert error:", error.message);
    } else {
      inserted += rows.length;
      console.log(`[gen-batch] ${subject}: +${rows.length} (total ${inserted})`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log(`[gen-batch] done ${subject}: inserted=${inserted}`);
  return { inserted };
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

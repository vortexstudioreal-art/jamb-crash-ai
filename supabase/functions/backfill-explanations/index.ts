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

function extractJsonArray(text: string): ExplRow[] {
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

function validExplanation(e: string): boolean {
  const t = (e || "").trim();
  if (t.length < 20 || t.length > 800) return false;
  if (/[<>`]/.test(t)) return false;
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

    const prompt = `Write a short explanation for each JAMB UTME multiple-choice question below: 2-3 plain sentences saying why the correct option is right (show key working for maths/physics). Plain text only, no markdown, no HTML, no quotes around the whole text.\n\n${numbered}\n\nReturn ONLY a valid JSON array, no other text. Each item exactly: {"n": <question number>, "explanation": "..."}`;

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
    for (const item of parsed) {
      const idx = (item.n || 0) - 1;
      if (idx < 0 || idx >= rows.length) continue;
      const expl = (item.explanation || "").trim();
      if (!validExplanation(expl)) continue;
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
      JSON.stringify({ updated, attempted: rows.length, remaining: remaining ?? 0 }),
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

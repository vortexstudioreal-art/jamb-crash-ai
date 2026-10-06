import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Candidate {
  id: string;
  subject: string;
  year: number | null;
  question: string;
  reason: string;
}

// Ends with a bare colon and no visible target (no ALLCAPS word or quoted
// segment near the end). e.g. "Choose the word with stress on the first
// syllable:" — versus valid "…nearest in meaning to ELATED:".
const hasEmptyTarget = (q: string): boolean => {
  if (!/:\s*$/.test(q) || q.length >= 120) return false;
  const tail = q.slice(-60);
  return !/[A-Z]{3,}/.test(tail) && !/["']/.test(tail);
};

// The target word itself is missing, e.g. "…how to spell the word".
const missingWord = (q: string): boolean => /spell the word\s*$/i.test(q);

async function audit(supabase: ReturnType<typeof createClient>) {
  const candidates: Candidate[] = [];
  let backticks = 0;
  let page = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("jamb_questions")
      .select("id, subject, year, question, option_a, option_b, option_c, option_d")
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data as {
      id: string; subject: string; year: number | null; question: string;
      option_a: string; option_b: string; option_c: string; option_d: string;
    }[]) {
      const q = (r.question || "").trim();
      if (hasEmptyTarget(q)) {
        candidates.push({ id: r.id, subject: r.subject, year: r.year, question: q.slice(0, 120), reason: "empty target" });
      } else if (missingWord(q)) {
        candidates.push({ id: r.id, subject: r.subject, year: r.year, question: q.slice(0, 120), reason: "missing word" });
      }
      const opts = [r.option_a, r.option_b, r.option_c, r.option_d].join(" ");
      if (q.includes("`") || opts.includes("`")) backticks++;
    }
    if (data.length < 1000) break;
    page++;
  }
  return { candidates, backticks };
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

    let body: { execute?: boolean; ids?: string[] } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Execute mode deletes ONLY explicitly passed ids (reviewed in audit).
    if (body.execute) {
      const ids = Array.isArray(body.ids) ? body.ids : [];
      let deleted = 0;
      for (let i = 0; i < ids.length; i += 100) {
        const { error, count } = await supabase
          .from("jamb_questions")
          .delete({ count: "exact" })
          .in("id", ids.slice(i, i + 100));
        if (error) throw error;
        deleted += count || 0;
      }
      // Sweep stray backticks left by dump imports (cosmetic, always safe:
      // backticks are never legitimate question content).
      const { data: ticked } = await supabase
        .from("jamb_questions")
        .select("id, question, option_a, option_b, option_c, option_d")
        .or("question.like.%`%,option_a.like.%`%,option_b.like.%`%,option_c.like.%`%,option_d.like.%`%")
        .limit(500);
      let cleaned = 0;
      for (const r of (ticked || []) as {
        id: string; question: string; option_a: string; option_b: string; option_c: string; option_d: string;
      }[]) {
        const patch: Record<string, string> = {};
        (["question", "option_a", "option_b", "option_c", "option_d"] as const).forEach((k) => {
          if (r[k]?.includes("`")) patch[k] = r[k].replace(/`/g, "");
        });
        if (Object.keys(patch).length > 0) {
          const { error } = await supabase.from("jamb_questions").update(patch).eq("id", r.id);
          if (!error) cleaned++;
        }
      }
      return new Response(JSON.stringify({ success: true, deleted, cleaned }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { candidates, backticks } = await audit(supabase);
    return new Response(
      JSON.stringify({ success: true, candidates, backticks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("prune-questions error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

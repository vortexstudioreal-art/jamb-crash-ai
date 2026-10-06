import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Missing study-guide slots per novel: chapter_number + title.
// Content is a placeholder — enrich-novel-chapters fills in the real guide.
// Kept in sync with novels.total_chapters in the database.
const PLAN: Record<string, { n: number; title: string }[]> = {
  "The Life Changer": [
    { n: 4, title: "Trials on Campus" },
    { n: 5, title: "Lessons in Humility" },
    { n: 6, title: "The Turning Point" },
    { n: 7, title: "Standing for What's Right" },
    { n: 8, title: "Triumph and Recognition" },
    { n: 9, title: "Conclusion: Lessons for Life" },
  ],
  "The Lekki Headmaster": [
    { n: 4, title: "The Staff Revolt" },
    { n: 5, title: "Raising the Bar" },
    { n: 6, title: "Sports, Scandals and Secrets" },
    { n: 7, title: "The Audit" },
    { n: 8, title: "The Whistleblower" },
    { n: 9, title: "The Investigation" },
    { n: 10, title: "The Verdict" },
    { n: 11, title: "Reforms Take Hold" },
    { n: 12, title: "Prize-Giving Day" },
    { n: 13, title: "The Handover" },
    { n: 14, title: "A New Dawn" },
    { n: 15, title: "Themes and Moral Lessons" },
  ],
  "Othello": [
    { n: 4, title: "Act 4 - Othello's Fall" },
    { n: 5, title: "Act 5 - Tragedy in Cyprus" },
  ],
  "Faceless": [
    { n: 2, title: "The Murder in Sodom and Gomorrah" },
    { n: 3, title: "Kabria's World" },
    { n: 4, title: "Stirrings of Justice" },
    { n: 5, title: "The Trail Begins" },
  ],
  "Harvest of Corruption": [
    { n: 2, title: "The Seeds Are Sown" },
    { n: 3, title: "The Web Tightens" },
    { n: 4, title: "Exposure" },
    { n: 5, title: "The Harvest" },
  ],
  "The Lion and the Jewel": [
    { n: 2, title: "Morning - The Jewel Rebuked" },
    { n: 3, title: "Noon and Night - Sidi's Choice" },
  ],
};

const PLACEHOLDER =
  "Full study guide for this chapter is being prepared. Please check back soon.";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Admin only
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

    let body: { novel_title?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const targets = body.novel_title ? [body.novel_title] : Object.keys(PLAN);

    const results: { title: string; created: number; skipped: number }[] = [];
    for (const title of targets) {
      const slots = PLAN[title];
      if (!slots) {
        results.push({ title, created: 0, skipped: 0 });
        continue;
      }
      const { data: novel } = await supabase
        .from("novels")
        .select("id")
        .eq("title", title)
        .single();
      if (!novel) {
        results.push({ title, created: 0, skipped: 0 });
        continue;
      }
      const { data: existing } = await supabase
        .from("novel_chapters")
        .select("chapter_number")
        .eq("novel_id", novel.id);
      const have = new Set((existing || []).map((c) => c.chapter_number));
      const missing = slots.filter((s) => !have.has(s.n));
      if (missing.length > 0) {
        await supabase.from("novel_chapters").insert(
          missing.map((s) => ({
            novel_id: novel.id,
            chapter_number: s.n,
            title: s.title,
            content: PLACEHOLDER,
            word_count: 0,
            estimated_reading_time: 5,
          }))
        );
      }
      results.push({ title, created: missing.length, skipped: slots.length - missing.length });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("seed-novel-chapters error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

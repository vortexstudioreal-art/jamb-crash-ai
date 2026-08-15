import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, count = 50, test } = await req.json();

    if (test) {
      return new Response(JSON.stringify({ status: "ok", message: "Ready" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetSubject = subject || "english";
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const prompt = `You are a JAMB exam question generator for Nigerian students. Generate ${count} unique JAMB multiple-choice questions for: ${targetSubject.toUpperCase()}.

CRITICAL: Return ONLY a JSON array. NO markdown, NO code blocks, NO extra text. The response must start with [ and end with ].

Each object format: {"question": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "A", "explanation": "..."}

Rules:
- correct_answer must be UPPERCASE: A, B, C, or D
- Realistic JAMB difficulty level
- Cover different topics within ${targetSubject}
- Include helpful explanations
- Generate EXACTLY ${count} questions in the array
- Each question MUST have all 4 options`;

    interface GeneratedQuestion {
      question: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_answer: string;
      explanation?: string;
      year?: number;
    }

    let questions: GeneratedQuestion[] = [];
    for (let attempt = 0; attempt < 3 && questions.length === 0; attempt++) {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 8192,
              temperature: 0.8,
            }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`API error ${response.status}: ${errText}, attempt ${attempt + 1}`);
        if (attempt < 2) await new Promise(r => setTimeout(r, 3000));
        continue;
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

      const arrayMatch = content.match(/\[[\s\S]*\]/);
      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (arrayMatch) {
        content = arrayMatch[0];
      } else if (objectMatch) {
        content = "[" + objectMatch[0] + "]";
      }

      try {
        const parsed = JSON.parse(content);
        questions = Array.isArray(parsed) ? parsed as GeneratedQuestion[] : [parsed as GeneratedQuestion];
      } catch {
        console.error(`Parse failed, attempt ${attempt + 1}`);
        if (attempt < 2) await new Promise(r => setTimeout(r, 3000));
      }
    }

    let inserted = 0;
    let skipped = 0;
    for (const q of questions) {
      if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) continue;

      const { data: existing } = await supabase
        .from("jamb_questions")
        .select("id")
        .eq("question", q.question)
        .maybeSingle();

      if (existing) { skipped++; continue; }

      const { error } = await supabase.from("jamb_questions").insert({
        subject: targetSubject.toLowerCase(),
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer.toUpperCase(),
        explanation: q.explanation || "",
        year: q.year || 2025,
      });

      if (!error) inserted++;
    }

    return new Response(JSON.stringify({
      success: true,
      subject: targetSubject,
      generated: questions.length,
      inserted,
      skipped,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Seed error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

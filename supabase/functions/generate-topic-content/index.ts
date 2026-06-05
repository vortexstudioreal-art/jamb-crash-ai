import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { topic, subject, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "explanation") {
      systemPrompt = `You are a friendly JAMB tutor for Nigerian secondary school students. Explain topics in simple, clear language with examples. Use Nigerian context where possible. Keep explanations engaging and easy to understand.`;
      userPrompt = `Explain the topic "${topic}" for ${subject} in a way that a Nigerian JAMB student can easily understand. Include:
1. Simple definition
2. Key points (bullet points)
3. Real-life Nigerian examples
4. Common mistakes to avoid
5. JAMB tips for this topic

Keep it concise but comprehensive.`;
    } else if (type === "flashcards") {
      systemPrompt = `You are a JAMB study assistant. Generate flashcards that help students memorize key concepts. Each flashcard should have a clear question on the front and a concise answer on the back.`;
      userPrompt = `Generate 5 flashcards for the topic "${topic}" in ${subject} for JAMB preparation. 
Return as JSON array with format: [{"front": "question", "back": "answer"}]
Make questions specific and answers concise but complete.`;
    } else if (type === "quiz") {
      systemPrompt = `You are a JAMB question generator. Create multiple choice questions similar to real JAMB past questions.`;
      userPrompt = `Generate 3 JAMB-style multiple choice questions for the topic "${topic}" in ${subject}.
Return as JSON array with format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": "A", "explanation": "..."}]
Make questions challenging but fair for JAMB level.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ content, type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating content:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

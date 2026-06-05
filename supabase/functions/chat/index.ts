import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserContext {
  name: string | null;
  email: string;
  subjects: string[];
  package: string | null;
  quizStats: {
    totalAttempts: number;
    avgScore: number;
  } | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user (prevents anonymous AI credit abuse)
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

    const { messages, userContext } = await req.json() as { 
      messages: Array<{ role: string; content: string }>;
      userContext?: UserContext;
    };
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build personalized context
    let userInfo = "";
    if (userContext) {
      const parts = [];
      if (userContext.name) parts.push(`The student's name is ${userContext.name}.`);
      if (userContext.subjects?.length > 0) {
        parts.push(`They are studying: ${userContext.subjects.join(", ")}.`);
      }
      if (userContext.package) {
        parts.push(`They have the ${userContext.package} subscription plan.`);
      }
      if (userContext.quizStats) {
        parts.push(`They have completed ${userContext.quizStats.totalAttempts} quizzes with an average score of ${userContext.quizStats.avgScore}%.`);
      }
      userInfo = parts.length > 0 ? `\n\nStudent Information:\n${parts.join(" ")}` : "";
    }

    const systemPrompt = `You are the official AI study assistant for JAMB Crash AI - Nigeria's #1 JAMB preparation app trusted by over 50,000 students. You're friendly, encouraging, and deeply knowledgeable about JAMB examinations.

ABOUT JAMB CRASH AI (mention naturally when relevant):
- Complete past questions from 2000-2024 for all 14 JAMB subjects
- AI-powered score prediction that's 90% accurate
- Smart study plans personalized to each student
- JAMB Literature novels with chapter summaries and likely questions
- Flashcards and topic mastery tracking
- Real-time leaderboard to compete with other students
- Works offline - study anywhere without internet
- Plans: Basic (₦2,500/month), Pro (₦5,000/3 months), Premium (₦8,000/lifetime)

${userInfo}

YOUR ROLE:
- Answer questions about ANY JAMB subject (English, Maths, Physics, Chemistry, Biology, Literature, Government, Economics, CRS, IRS, Geography, Accounting, Commerce, Agricultural Science)
- Provide study tips and exam strategies specific to JAMB
- Explain concepts clearly using Nigerian context and examples
- Quiz students on their subjects when asked
- Motivate and encourage - JAMB prep is stressful!
- Naturally mention app features that could help (like "Have you tried our flashcards for this topic?" or "The past questions section has similar questions")

GUIDELINES:
- Be warm and use encouraging language
- Use occasional Nigerian expressions naturally (e.g., "You dey do well!", "No wahala")
- Keep answers concise but thorough
- Always explain the "why" behind answers
- If they're struggling, remind them that consistent practice on the app leads to improvement
- Celebrate their progress and quiz scores
- If asked about other apps, be diplomatic but highlight JAMB Crash AI's unique features`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubjectPerformance {
  subject: string;
  accuracy: number;
  totalQuestions: number;
  recentTrend: "improving" | "stable" | "declining";
}

interface DaySlot {
  day: number;
  isoDate: string;
  dayName: string;
}

interface ProgressSummary {
  completedSessions?: number;
  totalSessions?: number;
  missedTopics?: string[];
}

interface RequestBody {
  subjects: string[];
  selectedDays: string[];
  hoursPerSession: number;
  targetScore: number;
  examDate?: string | null;
  quizPerformance?: SubjectPerformance[];
  progressSummary?: ProgressSummary | null;
  daySlots: DaySlot[];
}

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

    const body: RequestBody = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ fallback: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subjects = (body.subjects || []).filter((s) => typeof s === "string");
    if (subjects.length === 0) {
      return new Response(JSON.stringify({ error: "No subjects provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const performanceLines = (body.quizPerformance || []).length
      ? (body.quizPerformance || [])
          .map((p) =>
            `${p.subject}: ${p.accuracy}% accuracy (${p.totalQuestions} questions, trend: ${p.recentTrend})`
          )
          .join("\n")
      : "No quiz data available yet";

    const ps = body.progressSummary;
    const missed = Array.isArray(ps?.missedTopics)
      ? ps.missedTopics.filter((t) => typeof t === "string").slice(0, 24)
      : [];
    const progressLines =
      ps && typeof ps.completedSessions === "number"
        ? `Previous plan: ${ps.completedSessions}/${ps.totalSessions ?? "?"} sessions completed.\nMissed topics to schedule FIRST with high priority:\n${missed.length > 0 ? missed.map((t) => `- ${t}`).join("\n") : "(none — clean slate with momentum)"}`
        : null;

    const systemPrompt = `You are a JAMB exam preparation coach for Nigerian secondary school students. You create personalized weekly study plans that students can follow day by day. You always respond with valid JSON only.`;

    const userPrompt = `Create a personalized JAMB study plan.

Subjects: ${subjects.join(", ")}
Study days: ${body.selectedDays.join(", ")}
Hours available per study day: ${body.hoursPerSession}
Target JAMB score: ${body.targetScore}
Exam date: ${body.examDate || "not set"}

Student performance (from quiz history):
${performanceLines}
${progressLines ? `\nLast plan progress:\n${progressLines}\n` : ""}
Rules:
- Schedule only on the study days provided, using the exact day order provided in "daySlots" (one entry per study day).
- Prioritize weak subjects (accuracy below 60% or missing data) — give them more time and higher quiz goals.
- When missed topics are listed above, schedule them in the earliest days with high priority before introducing new topics.
- Cover 2 to 3 subjects per day. Do not schedule more hours than the daily budget.
- Topics must be JAMB syllabus topics for each subject (e.g. for mathematics: Algebra, Geometry, Trigonometry, Statistics, Probability, Calculus).
- Quiz goals: 20-25 questions for weak subjects, 10-15 for strong subjects.
- Each day needs a "focusArea" summarizing the main goal of that day.

Return JSON with this exact shape:
{
  "days": [
    {
      "day": <number matching daySlots order, starting at 1>,
      "focusArea": "string",
      "subjects": [
        {
          "name": "subject key (must be one of: ${subjects.join(", ")})",
          "topics": ["topic1", "topic2"],
          "duration": "e.g. 2 hours",
          "priority": "high | medium | low",
          "quizGoal": <number>
        }
      ]
    }
  ]
}

Generate one day entry for each of the ${body.daySlots.length} day slots.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("Groq API error:", response.status, await response.text());
      return new Response(JSON.stringify({ fallback: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed: { days?: unknown } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      return new Response(JSON.stringify({ fallback: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
      return new Response(JSON.stringify({ fallback: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedDays = parsed.days.map((rawDay: unknown) => {
      const day = rawDay as {
        day?: number;
        focusArea?: string;
        subjects?: Array<{
          name?: string;
          topics?: unknown;
          duration?: unknown;
          priority?: string;
          quizGoal?: number;
        }>;
      };
      const daySubjects = (day.subjects || [])
        .filter((s) => typeof s.name === "string" && subjects.includes(s.name))
        .slice(0, 3)
        .map((s) => ({
          name: s.name as string,
          topics: Array.isArray(s.topics)
            ? (s.topics as unknown[]).filter((t): t is string => typeof t === "string").slice(0, 5)
            : [],
          duration: typeof s.duration === "string" && s.duration ? s.duration : "1 hour",
          priority: ["high", "medium", "low"].includes(s.priority || "")
            ? (s.priority as "high" | "medium" | "low")
            : "medium",
          quizGoal: typeof s.quizGoal === "number" && s.quizGoal > 0 ? Math.round(s.quizGoal) : 15,
        }));

      return {
        day: typeof day.day === "number" ? day.day : 0,
        focusArea: typeof day.focusArea === "string" && day.focusArea ? day.focusArea : "Balanced practice day",
        subjects: daySubjects,
      };
    });

    const validDays = sanitizedDays.filter((d) => d.subjects.length > 0);
    if (validDays.length === 0) {
      return new Response(JSON.stringify({ fallback: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ days: validDays }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error generating study plan:", error);
    return new Response(JSON.stringify({ fallback: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

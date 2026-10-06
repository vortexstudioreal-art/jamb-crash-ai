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
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({
        content: `## ${topic}\n\nAI explanations are being set up. Please check back soon or contact support.\n\n### Study Tips\n- Review your JAMB past questions on this topic\n- Practice with our quiz feature\n- Discuss with your study group`,
        type,
        fallback: true
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "explanation") {
      systemPrompt = `You are a friendly JAMB tutor for Nigerian secondary school students. Explain topics in simple, clear language with examples. Use Nigerian context where possible. Keep explanations engaging and easy to understand. Format with markdown.`;
      userPrompt = `Explain the topic "${topic}" for ${subject} in a way that a Nigerian JAMB student can easily understand. Include:
1. Simple definition
2. Key points (bullet points)
3. Real-life Nigerian examples
4. Common mistakes to avoid
5. JAMB tips for this topic

Keep it concise but comprehensive.`;
    } else if (type === "flashcards") {
      systemPrompt = `You are a JAMB study assistant. Generate flashcards that help students memorize key concepts. Return ONLY valid JSON.`;
      userPrompt = `Generate 5 flashcards for the topic "${topic}" in ${subject} for JAMB preparation. 
Return as JSON array with format: [{"front": "question", "back": "answer"}]
Make questions specific and answers concise but complete.`;
    } else if (type === "quiz") {
      systemPrompt = `You are a JAMB question generator. Create multiple choice questions similar to real JAMB past questions. Return ONLY valid JSON.`;
      userPrompt = `Generate 3 JAMB-style multiple choice questions for the topic "${topic}" in ${subject}.
Return as JSON array with format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": "A", "explanation": "..."}]
Make questions challenging but fair for JAMB level.`;
    } else if (type === "lesson") {
      systemPrompt = `You are an expert JAMB curriculum designer for Nigerian secondary school students. You generate structured lesson content in a specific JSON format. You NEVER output freestyle markdown. You ALWAYS output valid JSON matching the schema provided. You reference interactive components by name only (never generate code). Be educational, engaging, and use Nigerian context where appropriate.`;

      userPrompt = `Generate a structured JAMB lesson for "${topic}" in ${subject}.

OUTPUT SCHEMA (follow exactly):
{
  "subject": "${subject}",
  "topic": "${topic}",
  "subtopic": "string (category within the subject)",
  "title": "string (engaging lesson title)",
  "learning_objectives": ["string array of 3-5 objectives"],
  "difficulty_level": "easy|medium|hard",
  "estimated_minutes": number,
  "content_sections": [
    {
      "id": "unique_section_id",
      "type": "hook|intuitive_explanation|formal_explanation|formula|worked_example|jamb_focus|practice|summary|mastery_check|interactive|diagram|common_misconception",
      "order": number,
      "content": { /* varies by type — see below */ }
    }
  ],
  "version": 1,
  "status": "published"
}

SECTION CONTENT TYPES:

1. hook: { "text": "engaging opening", "prediction_prompt": "question to think about" }

2. intuitive_explanation: { "text": "plain-English explanation", "analogy": "relatable comparison" }

3. formal_explanation: { "text": "precise academic explanation", "key_terms": [{"term": "word", "definition": "meaning"}] }

4. formula: { "formula": "equation", "variables": [{"name": "x", "description": "what it means", "unit": "unit"}], "when_to_use": "...", "common_traps": ["..."], "units_note": "..." }

5. worked_example: { "problem": "...", "steps": ["step1", "step2"], "answer": "...", "explanation": "why it works" }

6. jamb_focus: { "frequency": "how often on JAMB", "typical_question": "example question", "common_mistakes": ["..."], "exam_tip": "..." }

7. practice: { "questions": [{"question": "...", "options": ["A","B","C","D"], "correct_index": 0, "explanation": "..."}] }

8. summary: { "key_takeaways": ["..."], "connections": ["next topic connections"] }

9. mastery_check: { "description": "...", "min_score": 80, "required_sections": ["section_ids"] }

10. interactive: { "component": "formula_calculator|wave_simulator|motion_simulator|electrolysis_simulator", "config": {}, "instruction": "..." }

11. diagram: { "description": "...", "labels": [{"text": "label", "x": 0.5, "y": 0.5}], "caption": "..." }

12. common_misconception: { "misconception": "...", "correction": "...", "why_confusing": "..." }

RULES:
- Generate exactly 7-10 content sections
- ALWAYS start with a hook, include intuitive + formal explanations, at least one formula or worked example, practice questions, and end with summary + mastery_check
- Use Nigerian context and examples where possible
- Reference interactive components by name only (e.g., "formula_calculator"), never generate executable code
- For JAMB focus: base frequency claims on the topic's importance in the JAMB syllabus
- Output ONLY the JSON object, no other text`;

    } else if (type === "quiz_from_lesson") {
      systemPrompt = `You are a JAMB quiz generator. Generate questions based on a structured lesson. Return ONLY valid JSON.`;
      userPrompt = `Based on the lesson "${topic}" in ${subject}, generate 5 JAMB-style multiple choice questions.
Return as JSON array with format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "..."}]
Make questions test understanding, not just recall. Include tricky options that test common misconceptions.`;
    }

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
        max_tokens: type === "lesson" ? 4096 : 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("Groq API error:", response.status);
      return new Response(JSON.stringify({
        content: `## ${topic}\n\nAI explanations are temporarily unavailable. Please try again later.\n\n### Study Tips\n- Review your JAMB past questions on this topic\n- Practice with our quiz feature\n- Discuss with your study group`,
        type,
        fallback: true
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    if (!content) {
      throw new Error("Empty response from AI");
    }

    // For lesson type, parse JSON and validate
    if (type === "lesson") {
      try {
        const parsed = JSON.parse(content);
        // Basic validation
        if (!parsed.subject || !parsed.topic || !parsed.content_sections) {
          throw new Error("Invalid lesson structure");
        }
        return new Response(
          JSON.stringify({ content: parsed, type }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr);
        // Return the raw content as fallback
        return new Response(
          JSON.stringify({ content, type, parse_error: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

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

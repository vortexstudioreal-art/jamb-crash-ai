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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { novel_title, chapter_number, enrich_all_poetry, poem_title } = await req.json();

    // Mode 1: Enrich poetry by splitting into multiple chapters
    if (enrich_all_poetry) {
      return await enrichAllPoetry(supabase, LOVABLE_API_KEY, poem_title);
    }

    const targetTitle = novel_title || "The Life Changer";
    const targetChapter = chapter_number || null;

    const { data: novel, error: novelError } = await supabase
      .from("novels")
      .select("id, title, author, category")
      .eq("title", targetTitle)
      .single();

    if (novelError || !novel) {
      return new Response(JSON.stringify({ error: `Novel "${targetTitle}" not found` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let query = supabase
      .from("novel_chapters")
      .select("id, chapter_number, title, content")
      .eq("novel_id", novel.id)
      .order("chapter_number");

    if (targetChapter) {
      query = query.eq("chapter_number", targetChapter);
    }

    const { data: chapters, error: chapError } = await query;
    if (chapError || !chapters?.length) {
      return new Response(JSON.stringify({ error: "No chapters found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const chapter of chapters) {
      console.log(`Enriching: ${novel.title} - Chapter ${chapter.chapter_number}: ${chapter.title}`);

      const isPoetry = (novel.category || "").includes("poetry");
      const prompt = isPoetry
        ? buildPoetryPrompt(novel, chapter)
        : buildProsePrompt(novel, chapter);

      try {
        const enrichedContent = await callAI(LOVABLE_API_KEY, prompt, novel);
        if (!enrichedContent) {
          results.push({ chapter: chapter.chapter_number, status: "error", error: "No content generated" });
          continue;
        }

        const wordCount = enrichedContent.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);
        const questions = extractQuestions(enrichedContent);

        const { error: updateError } = await supabase
          .from("novel_chapters")
          .update({
            content: enrichedContent,
            word_count: wordCount,
            estimated_reading_time: readingTime,
            likely_questions: questions,
          })
          .eq("id", chapter.id);

        if (updateError) {
          results.push({ chapter: chapter.chapter_number, status: "error", error: updateError.message });
        } else {
          results.push({
            chapter: chapter.chapter_number,
            title: chapter.title,
            status: "enriched",
            oldLength: chapter.content.length,
            newLength: enrichedContent.length,
            wordCount,
          });
          console.log(`✅ Chapter ${chapter.chapter_number} enriched: ${wordCount} words`);
        }

        if (chapters.length > 1) await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        results.push({ chapter: chapter.chapter_number, status: "error", error: String(err) });
      }
    }

    return new Response(JSON.stringify({
      novel: novel.title,
      chaptersProcessed: results.length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("enrich-novel-chapters error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Split poetry into multiple analysis chapters
async function enrichAllPoetry(supabase: any, apiKey: string, onlyTitle?: string) {
  let q = supabase
    .from("novels")
    .select("id, title, author, total_chapters, category")
    .like("category", "%poetry%");
  if (onlyTitle) q = q.eq("title", onlyTitle);
  const { data: poems } = await q;

  if (!poems?.length) {
    return new Response(JSON.stringify({ message: "No poetry found" }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const results: any[] = [];

  for (const poem of poems) {
    // Only process poems with 1 chapter (not yet enriched)
    if (poem.total_chapters > 1) {
      results.push({ title: poem.title, status: "skipped", reason: "already has multiple chapters" });
      continue;
    }

    console.log(`Enriching poetry: ${poem.title}`);

    // Get existing chapter
    const { data: existingChapters } = await supabase
      .from("novel_chapters")
      .select("id, content")
      .eq("novel_id", poem.id);

    const existingContent = existingChapters?.[0]?.content || "";

    // Generate 4 separate chapters for this poem
    const chapterPlans = [
      { num: 1, title: "Summary & Context", focus: "comprehensive summary, historical context, author background, and the poem's place in literature" },
      { num: 2, title: "Line-by-Line Analysis", focus: "detailed line-by-line or stanza-by-stanza analysis explaining meaning, imagery, and word choices" },
      { num: 3, title: "Themes & Literary Devices", focus: "major themes, literary devices (metaphor, simile, personification, alliteration, etc.), tone, mood, and style" },
      { num: 4, title: "Practice Questions", focus: "10 JAMB-style multiple choice questions with options A-D, correct answers, and explanations" },
    ];

    // Delete existing single chapter
    if (existingChapters?.[0]?.id) {
      await supabase.from("novel_chapters").delete().eq("novel_id", poem.id);
    }

    let chaptersCreated = 0;

    for (const plan of chapterPlans) {
      const prompt = `You are a JAMB exam preparation expert. Create a detailed study guide section for the poem "${poem.title}" by ${poem.author}.

This is Chapter ${plan.num}: "${plan.title}"
Focus on: ${plan.focus}

The poem's existing analysis: "${existingContent.substring(0, 500)}"

Write 1500-2500 words of detailed, student-friendly content. Use markdown formatting with headers (##, ###).
${plan.num === 4 ? "Format each question as: number, question text, A) option, B) option, C) option, D) option, Answer: X, Explanation: text" : ""}

IMPORTANT: Be factually accurate about this poem. This is a JAMB 2025 prescribed text.`;

      try {
        const content = await callAI(apiKey, prompt, poem);
        if (!content) continue;

        const wordCount = content.split(/\s+/).length;
        const questions = plan.num === 4 ? extractQuestions(content) : null;

        await supabase.from("novel_chapters").insert({
          novel_id: poem.id,
          chapter_number: plan.num,
          title: plan.title,
          content,
          word_count: wordCount,
          estimated_reading_time: Math.ceil(wordCount / 200),
          likely_questions: questions,
        });

        chaptersCreated++;
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`Error creating chapter ${plan.num} for ${poem.title}:`, err);
      }
    }

    // Update total_chapters
    if (chaptersCreated > 0) {
      await supabase
        .from("novels")
        .update({ total_chapters: chaptersCreated })
        .eq("id", poem.id);
    }

    results.push({ title: poem.title, status: "enriched", chaptersCreated });
  }

  return new Response(JSON.stringify({ type: "poetry_enrichment", results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(apiKey: string, prompt: string, novel: any): Promise<string | null> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an expert literature teacher specializing in JAMB exam preparation for Nigerian students." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    console.error(`AI error: ${response.status}`);
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

function buildProsePrompt(novel: any, chapter: any): string {
  return `Create a comprehensive study guide for Chapter ${chapter.chapter_number} ("${chapter.title}") of "${novel.title}" by ${novel.author}.

Current content: "${chapter.content.substring(0, 300)}"

Generate 2000-3000 words with:
## Chapter ${chapter.chapter_number}: ${chapter.title}
### Detailed Summary
### Character Analysis  
### Key Themes & Motifs
### Important Quotes & Analysis
### Literary Devices
### JAMB Likely Questions (5 MCQs with A-D options and answers)
### Key Takeaways

Be factually accurate. JAMB 2025 prescribed text.`;
}

function buildPoetryPrompt(novel: any, chapter: any): string {
  return `Create a comprehensive study guide for "${novel.title}" by ${novel.author} - ${chapter.title}.

Current content: "${chapter.content.substring(0, 300)}"

Generate 2000-3000 words covering summary, line analysis, themes, literary devices, and 5 JAMB MCQs.`;
}

function extractQuestions(content: string): any[] {
  const questions: any[] = [];
  const lines = content.split("\n");
  let currentQ: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const qMatch = line.match(/^\*?\*?(\d+)\.\s*(.+)/);
    if (qMatch && !line.startsWith("A.") && !line.startsWith("B.") && !line.startsWith("C.") && !line.startsWith("D.")) {
      if (currentQ?.question) questions.push(currentQ);
      currentQ = { question: qMatch[2].replace(/\*\*/g, ""), options: {} };
      continue;
    }
    if (currentQ) {
      const optMatch = line.match(/^([A-D])[.)]\s*(.+)/);
      if (optMatch) {
        currentQ.options[optMatch[1]] = optMatch[2].replace(/\*\*/g, "").replace(/✓|✅|→.*$/, "").trim();
        if (line.includes("✓") || line.includes("✅") || line.includes("Correct")) {
          currentQ.correct_answer = optMatch[1];
        }
      }
      const ansMatch = line.match(/(?:Answer|Correct)[:\s]*([A-D])/i);
      if (ansMatch) currentQ.correct_answer = ansMatch[1];
    }
  }
  if (currentQ?.question) questions.push(currentQ);
  return questions.slice(0, 8);
}

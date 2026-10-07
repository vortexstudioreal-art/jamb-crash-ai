import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NovelLike {
  id: string;
  title: string;
  author: string;
  category?: string | null;
  total_chapters?: number | null;
}

interface ChapterLike {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  word_count?: number | null;
}

interface ExtractedQuestion {
  question: string;
  options: Record<string, string>;
  correct_answer?: string;
}

interface PoetryResult {
  title: string;
  status: string;
  chaptersCreated?: number;
  reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { novel_title, chapter_number, enrich_all_poetry, poem_title } = await req.json();

    // Mode 1: Enrich poetry by splitting into multiple chapters (background)
    if (enrich_all_poetry) {
      // @ts-expect-error EdgeRuntime is available in Deno deploy
      EdgeRuntime.waitUntil(enrichAllPoetry(supabase, GROQ_API_KEY, poem_title));
      return new Response(JSON.stringify({ status: "started", mode: "poetry", poem_title: poem_title || "all" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      .select("id, chapter_number, title, content, word_count")
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

    // Background prose/drama enrichment
    // @ts-expect-error EdgeRuntime is available in Deno deploy
    EdgeRuntime.waitUntil(enrichProseChapters(supabase, GROQ_API_KEY, novel, chapters));
    return new Response(JSON.stringify({
      status: "started",
      novel: novel.title,
      chaptersQueued: chapters.length,
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

async function enrichProseChapters(supabase: SupabaseClient, apiKey: string, novel: NovelLike, chapters: ChapterLike[]) {
  // Gap-fill only: chapters already rich are skipped, so re-running is
  // cheap and safe (a killed run can simply be started again).
  const pending = chapters.filter((c) => (c.word_count || 0) < 500);
  console.log(`${novel.title}: ${pending.length}/${chapters.length} chapters need enrichment`);
  for (const chapter of pending) {
    try {
      console.log(`Enriching: ${novel.title} - Ch ${chapter.chapter_number}`);
      const isPoetry = (novel.category || "").includes("poetry");
      const prompt = isPoetry ? buildPoetryPrompt(novel, chapter) : buildProsePrompt(novel, chapter);
      const enrichedContent = await callAI(apiKey, prompt, novel);
      if (!enrichedContent) continue;
      const wordCount = enrichedContent.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      const questions = extractQuestions(enrichedContent);
      await supabase.from("novel_chapters").update({
        content: enrichedContent,
        word_count: wordCount,
        estimated_reading_time: readingTime,
        likely_questions: questions,
      }).eq("id", chapter.id);
      console.log(`✅ ${novel.title} Ch ${chapter.chapter_number}: ${wordCount} words`);
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`Failed ${novel.title} Ch ${chapter.chapter_number}:`, err);
    }
  }
  console.log(`🎉 Done enriching ${novel.title}`);
}

// Split poetry into multiple analysis chapters
async function enrichAllPoetry(supabase: SupabaseClient, apiKey: string, onlyTitle?: string) {
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

  const results: PoetryResult[] = [];

  for (const poem of poems) {
    // Only process poems with fewer than 4 guide chapters (resumable —
    // a failed run can be retried without losing anything).
    const { count: chapterCount } = await supabase
      .from("novel_chapters")
      .select("id", { count: "exact", head: true })
      .eq("novel_id", poem.id);
    if ((chapterCount || 0) >= 4) {
      results.push({ title: poem.title, status: "skipped", reason: "already has guide chapters" });
      continue;
    }

    console.log(`Enriching poetry: ${poem.title}`);

    // Get existing chapter (kept until replacements are safely stored)
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

    // Generate everything BEFORE deleting anything — an AI failure must
    // never wipe the existing chapter (that data loss already happened once).
    const built: {
      plan: { num: number; title: string };
      content: string;
      wordCount: number;
      questions: ExtractedQuestion[] | null;
    }[] = [];

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
        built.push({ plan, content, wordCount, questions });
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`Error creating chapter ${plan.num} for ${poem.title}:`, err);
      }
    }

    if (built.length === 0) {
      results.push({ title: poem.title, status: "failed", reason: "AI returned nothing — existing content kept" });
      continue;
    }

    // Replace old chapters only now that replacements exist
    await supabase.from("novel_chapters").delete().eq("novel_id", poem.id);

    let chaptersCreated = 0;
    for (const b of built) {
      const { error } = await supabase.from("novel_chapters").insert({
        novel_id: poem.id,
        chapter_number: b.plan.num,
        title: b.plan.title,
        content: b.content,
        word_count: b.wordCount,
        estimated_reading_time: Math.ceil(b.wordCount / 200),
        likely_questions: b.questions,
      });
      if (!error) chaptersCreated++;
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

async function callAI(apiKey: string, prompt: string, novel: NovelLike): Promise<string | null> {
  const maxAttempts = 6;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: "You are an expert literature teacher specializing in JAMB exam preparation for Nigerian students." },
          { role: "user", content: prompt },
        ],
        // Capped: guides ask for 1500-2500 words; uncapped outputs burn
        // through the shared key's limits and starve quiz AI for everyone.
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }

    if (response.status === 429 || response.status === 503) {
      const wait = Math.min(60000, 5000 * Math.pow(2, attempt - 1));
      console.warn(`AI ${response.status}, retry ${attempt}/${maxAttempts} after ${wait}ms`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    console.error(`AI error: ${response.status}`);
    return null;
  }
  console.error("AI exhausted retries");
  return null;
}

function buildProsePrompt(novel: NovelLike, chapter: ChapterLike): string {
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

function buildPoetryPrompt(novel: NovelLike, chapter: ChapterLike): string {
  return `Create a comprehensive study guide for "${novel.title}" by ${novel.author} - ${chapter.title}.

Current content: "${chapter.content.substring(0, 300)}"

Generate 2000-3000 words covering summary, line analysis, themes, literary devices, and 5 JAMB MCQs.`;
}

function extractQuestions(content: string): ExtractedQuestion[] {
  const questions: ExtractedQuestion[] = [];
  const lines = content.split("\n");
  let currentQ: ExtractedQuestion | null = null;

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

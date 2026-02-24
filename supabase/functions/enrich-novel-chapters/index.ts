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

    const { novel_title, chapter_number } = await req.json();
    const targetTitle = novel_title || "The Life Changer";
    const targetChapter = chapter_number || null; // null = all chapters

    // Get novel
    const { data: novel, error: novelError } = await supabase
      .from("novels")
      .select("id, title, author")
      .eq("title", targetTitle)
      .single();

    if (novelError || !novel) {
      return new Response(JSON.stringify({ error: `Novel "${targetTitle}" not found` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get chapters to enrich
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

      const prompt = `You are a JAMB exam preparation expert. Create a comprehensive, detailed study guide for Chapter ${chapter.chapter_number} ("${chapter.title}") of "${novel.title}" by ${novel.author}.

The current content is a brief summary: "${chapter.content}"

Generate a RICH, DETAILED chapter study guide (2000-3000 words) with these sections:

## Chapter ${chapter.chapter_number}: ${chapter.title}

### Detailed Summary
Write a thorough, paragraph-by-paragraph summary of everything that happens in this chapter. Include all important events, conversations, and developments. Be specific with character names, dialogue references, and plot points.

### Character Analysis
For each character that appears in this chapter:
- **Character Name**: Their role, personality traits shown, motivations, and how they develop
- Include both major and minor characters

### Key Themes & Motifs
Identify and explain 3-5 themes present in this chapter with specific examples from the text:
- Theme name and how it manifests
- Connection to the overall novel themes

### Important Quotes & Analysis
List 5-8 significant quotes or paraphrased passages with analysis:
- "Quote or close paraphrase" — Explanation of its significance

### Literary Devices
Identify literary techniques used (irony, foreshadowing, symbolism, etc.) with examples.

### JAMB Likely Questions
Create 5 multiple-choice questions that JAMB might ask about this chapter:
Each with options A-D and the correct answer marked, plus brief explanation.

### Key Takeaways
Bullet-point list of the most important things to remember for exams.

IMPORTANT: Be factually accurate about the novel's content. This is "${novel.title}" by ${novel.author}, a JAMB 2025 prescribed text. Write in clear, student-friendly language.`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are an expert literature teacher specializing in JAMB exam preparation for Nigerian students. You have deep knowledge of all JAMB prescribed texts." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`AI error for chapter ${chapter.chapter_number}:`, aiResponse.status, errText);
          results.push({ chapter: chapter.chapter_number, status: "error", error: `AI returned ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        const enrichedContent = aiData.choices?.[0]?.message?.content;

        if (!enrichedContent) {
          results.push({ chapter: chapter.chapter_number, status: "error", error: "No content generated" });
          continue;
        }

        // Count words in enriched content
        const wordCount = enrichedContent.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // ~200 wpm reading speed

        // Generate likely questions as JSON
        const questions = extractQuestions(enrichedContent);

        // Update the chapter
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
          console.error(`DB update error for chapter ${chapter.chapter_number}:`, updateError);
          results.push({ chapter: chapter.chapter_number, status: "error", error: updateError.message });
        } else {
          results.push({
            chapter: chapter.chapter_number,
            title: chapter.title,
            status: "enriched",
            oldLength: chapter.content.length,
            newLength: enrichedContent.length,
            wordCount,
            readingTime,
          });
          console.log(`✅ Chapter ${chapter.chapter_number} enriched: ${chapter.content.length} → ${enrichedContent.length} chars (${wordCount} words)`);
        }

        // Small delay between chapters to avoid rate limiting
        if (chapters.length > 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (err) {
        console.error(`Error enriching chapter ${chapter.chapter_number}:`, err);
        results.push({ chapter: chapter.chapter_number, status: "error", error: String(err) });
      }
    }

    return new Response(JSON.stringify({
      novel: novel.title,
      author: novel.author,
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

function extractQuestions(content: string): any[] {
  // Try to extract questions from the generated content
  const questions: any[] = [];
  const lines = content.split("\n");
  let currentQ: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match question patterns like "1." or "**1."
    const qMatch = line.match(/^\*?\*?(\d+)\.\s*(.+)/);
    if (qMatch && !line.startsWith("A.") && !line.startsWith("B.") && !line.startsWith("C.") && !line.startsWith("D.")) {
      if (currentQ && currentQ.question) {
        questions.push(currentQ);
      }
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
      if (ansMatch) {
        currentQ.correct_answer = ansMatch[1];
      }
    }
  }
  if (currentQ && currentQ.question) {
    questions.push(currentQ);
  }

  return questions.slice(0, 8);
}

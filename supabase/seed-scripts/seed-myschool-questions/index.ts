import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Subject slug → our jamb_subject enum mapping
const SUBJECT_MAP: Record<string, string> = {
  "english-language": "english",
  "mathematics": "mathematics",
  "physics": "physics",
  "chemistry": "chemistry",
  "biology": "biology",
  "literature-in-english": "literature",
  "government": "government",
  "economics": "economics",
  "christian-religious-knowledge-crk": "crs",
  "islamic-religious-knowledge-irk": "irs",
  "geography": "geography",
  "accounts-principles-of-accounts": "accounting",
  "commerce": "commerce",
  "agricultural-science": "agricultural_science",
};

// Target: subject slug → [count per year, years to fetch]
const SEED_CONFIG: Record<string, { perYear: number; years: number[] }> = {
  "english-language": { perYear: 30, years: [2024, 2023, 2022, 2021, 2020] },
  "mathematics": { perYear: 30, years: [2024, 2023, 2022, 2021, 2020] },
  "physics": { perYear: 20, years: [2024, 2023, 2022, 2021, 2020] },
  "chemistry": { perYear: 20, years: [2024, 2023, 2022, 2021, 2020] },
  "biology": { perYear: 20, years: [2024, 2023, 2022, 2021, 2020] },
  "economics": { perYear: 16, years: [2024, 2023, 2022, 2021, 2020] },
  "government": { perYear: 16, years: [2024, 2023, 2022, 2021, 2020] },
  "literature-in-english": { perYear: 12, years: [2024, 2023, 2022, 2021, 2020] },
  "geography": { perYear: 12, years: [2024, 2023, 2022, 2021, 2020] },
  "commerce": { perYear: 8, years: [2024, 2023, 2022, 2021, 2020] },
  "accounts-principles-of-accounts": { perYear: 8, years: [2024, 2023, 2022, 2021, 2020] },
  "christian-religious-knowledge-crk": { perYear: 4, years: [2024, 2023, 2022, 2021, 2020] },
  "islamic-religious-knowledge-irk": { perYear: 4, years: [2024, 2023, 2022, 2021, 2020] },
  "agricultural-science": { perYear: 4, years: [2024, 2023, 2022, 2021, 2020] },
};

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?p>/gi, "\n")
    .replace(/<\/?strong>/gi, "")
    .replace(/<\/?em>/gi, "")
    .replace(/<\/?u>/gi, "")
    .replace(/<\/?ins>/gi, "")
    .replace(/<\/?sub>/gi, "")
    .replace(/<\/?sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchMyschoolQuestions(
  subjectSlug: string,
  examYear: number,
  page: number
): Promise<{ questions: any[]; lastPage: number }> {
  const url = `https://myschool.ng/api/web/v1/classroom/${subjectSlug}?page=${page}&exam_type=jamb&exam_year=${examYear}`;

  const resp = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json",
    },
  });

  if (!resp.ok) {
    console.log(`  HTTP ${resp.status} for ${subjectSlug} ${examYear} page ${page}`);
    return { questions: [], lastPage: 0 };
  }

  const data = await resp.json();

  if (!data?.data?.practice_questions?.data) {
    console.log(`  No questions data for ${subjectSlug} ${examYear} page ${page}`);
    return { questions: [], lastPage: 0 };
  }

  const pq = data.data.practice_questions;
  return {
    questions: pq.data || [],
    lastPage: pq.last_page || 1,
  };
}

function mapQuestion(q: any, subjectEnum: string, year: number) {
  const options = q.options || [];
  if (options.length < 4) return null;

  const correctIdx = options.findIndex((o: any) => o.is_correct === 1);
  if (correctIdx === -1) return null;

  const tagToKey: Record<string, string> = {
    a: "option_a",
    b: "option_b",
    c: "option_c",
    d: "option_d",
  };

  const sorted = [...options].sort((a: any, b: any) => {
    const order = ["a", "b", "c", "d"];
    return order.indexOf(a.tag) - order.indexOf(b.tag);
  });

  const correctAnswer = sorted[correctIdx].tag.toUpperCase();

  return {
    subject: subjectEnum,
    year: year,
    question: stripHtml(q.question || ""),
    option_a: stripHtml(sorted[0]?.description || ""),
    option_b: stripHtml(sorted[1]?.description || ""),
    option_c: stripHtml(sorted[2]?.description || ""),
    option_d: stripHtml(sorted[3]?.description || ""),
    correct_answer: correctAnswer,
    explanation: "",
    image_url: q.image || null,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;
    const targetSubject = body.subject || null;

    const results: Record<string, { fetched: number; inserted: number; skipped: number }> = {};
    let totalInserted = 0;
    let totalSkipped = 0;

    const subjects = targetSubject
      ? { [targetSubject]: SEED_CONFIG[targetSubject] }
      : SEED_CONFIG;

    for (const [subjectSlug, config] of Object.entries(subjects)) {
      const subjectEnum = SUBJECT_MAP[subjectSlug];
      if (!subjectEnum) {
        console.log(`Skipping unknown subject: ${subjectSlug}`);
        continue;
      }

      console.log(`\n=== Seeding ${subjectEnum} (${subjectSlug}) ===`);
      let fetched = 0;
      let inserted = 0;
      let skipped = 0;

      for (const year of config.years) {
        let page = 1;
        let yearInserted = 0;

        while (yearInserted < config.perYear) {
          console.log(`  Fetching ${subjectSlug} ${year} page ${page}...`);

          const { questions, lastPage } = await fetchMyschoolQuestions(subjectSlug, year, page);
          fetched += questions.length;

          if (questions.length === 0) break;

          for (const q of questions) {
            if (yearInserted >= config.perYear) break;

            const mapped = mapQuestion(q, subjectEnum, year);
            if (!mapped) { skipped++; continue; }
            if (!mapped.question || mapped.question.length < 10) { skipped++; continue; }

            // Deduplicate by checking existing question text
            const { data: existing } = await supabase
              .from("jamb_questions")
              .select("id")
              .eq("subject", subjectEnum)
              .eq("question", mapped.question)
              .limit(1);

            if (existing && existing.length > 0) {
              skipped++;
              continue;
            }

            if (!dryRun) {
              const { error } = await supabase.from("jamb_questions").insert(mapped);
              if (error) {
                console.log(`  Insert error: ${error.message}`);
                skipped++;
                continue;
              }
            }

            inserted++;
            yearInserted++;
          }

          if (page >= lastPage) break;
          page++;

          // Rate limit: 200ms between pages
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      results[subjectEnum] = { fetched, inserted, skipped };
      totalInserted += inserted;
      totalSkipped += skipped;
      console.log(`  Done: ${inserted} inserted, ${skipped} skipped`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        dry_run: dryRun,
        total_inserted: totalInserted,
        total_skipped: totalSkipped,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Seed error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

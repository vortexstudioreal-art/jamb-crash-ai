import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: allTopics } = await supabase.from('jamb_syllabus').select('id, subject, topic').is('reference_materials', null);
    if (!allTopics || allTopics.length === 0) {
      return new Response(JSON.stringify({ message: "All topics already have references or no topics found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const TEXTBOOKS: Record<string, { title: string; author: string }[]> = {
      english: [
        { title: "New Oxford Secondary English Course", author: "Ayo Banjo et al." },
        { title: "Exam Focus: English Language", author: "J. O. O. Ogunyemi" },
      ],
      mathematics: [
        { title: "New General Mathematics for SSS", author: "J. B. Channon et al." },
        { title: "Exam Focus: Mathematics", author: "O. A. O. Afolabi" },
      ],
      physics: [
        { title: "New School Physics", author: "M. W. Anyakoha" },
        { title: "Exam Focus: Physics", author: "O. A. O. Afolabi" },
      ],
      chemistry: [
        { title: "New School Chemistry", author: "O. Y. Ababio" },
        { title: "Exam Focus: Chemistry", author: "O. A. O. Afolabi" },
      ],
      biology: [
        { title: "New School Biology", author: "P. A. Egwu" },
        { title: "Exam Focus: Biology", author: "O. A. O. Afolabi" },
      ],
      literature: [
        { title: "Exam Focus: Literature in English", author: "O. A. O. Afolabi" },
        { title: "The Study of Poetry", author: "M. J. C. Echeruo" },
      ],
      government: [
        { title: "New Government for SSS", author: "O. O. Ojo" },
        { title: "Exam Focus: Government", author: "O. A. O. Afolabi" },
      ],
      economics: [
        { title: "New Economics for SSS", author: "P. A. Ogunleye" },
        { title: "Exam Focus: Economics", author: "O. A. O. Afolabi" },
      ],
      geography: [
        { title: "New Geography for SSS", author: "I. O. O. Ogunyemi" },
        { title: "Exam Focus: Geography", author: "O. A. O. Afolabi" },
      ],
      crs: [
        { title: "Exam Focus: Christian Religious Studies", author: "O. A. O. Afolabi" },
        { title: "The Bible (Revised Standard Version)" },
      ],
      irs: [
        { title: "Exam Focus: Islamic Religious Studies", author: "O. A. O. Afolabi" },
        { title: "The Holy Quran (Translation by Yusuf Ali)" },
      ],
      agricultural_science: [
        { title: "New Agricultural Science for SSS", author: "O. A. O. Afolabi" },
        { title: "Exam Focus: Agricultural Science", author: "O. A. O. Afolabi" },
      ],
      commerce: [
        { title: "New Commerce for SSS", author: "A. O. Ogunyemi" },
        { title: "Exam Focus: Commerce", author: "O. A. O. Afolabi" },
      ],
      accounting: [
        { title: "New Accounting for SSS", author: "P. A. Ogunleye" },
        { title: "Exam Focus: Accounting", author: "O. A. O. Afolabi" },
      ],
    };

    let updated = 0;
    for (const topic of allTopics) {
      const refs = TEXTBOOKS[topic.subject] || [
        { title: "JAMB Recommended Textbook", author: "Various" },
      ];
      // Add JAMB past questions as a universal reference
      const fullRefs = [
        ...refs,
        { title: "JAMB Past Questions and Answers", author: "JAMB" },
      ];
      await supabase.from('jamb_syllabus').update({ reference_materials: fullRefs }).eq('id', topic.id);
      updated++;
    }

    return new Response(JSON.stringify({
      success: true, message: `Updated ${updated} syllabus topics with reference materials`,
      updated,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

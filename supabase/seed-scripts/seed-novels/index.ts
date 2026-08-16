import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Seed novels
    const novels = [
      {
        title: "The Lekki Headmaster",
        author: "Kabir Alabi Garba",
        description: "The 2025 JAMB recommended novel for Use of English. A compelling story about education, culture, and societal values in modern Nigeria.",
        category: "general_reading",
        year: 2025,
        is_premium: false,
        total_chapters: 8,
      },
      {
        title: "The Life Changer",
        author: "Khadija Abubakar Jali",
        description: "The 2024 JAMB recommended novel. A story about university life, family dynamics, and the choices that shape our destinies.",
        category: "general_reading",
        year: 2024,
        is_premium: false,
        total_chapters: 9,
      },
      {
        title: "Second Class Citizen",
        author: "Buchi Emecheta",
        description: "An African prose classic exploring themes of immigration, gender roles, and the pursuit of dreams in 1960s London.",
        category: "african_prose",
        is_premium: false,
        total_chapters: 10,
      },
      {
        title: "Unexpected Joy at Dawn",
        author: "Alex Agyei-Agyiri",
        description: "A powerful narrative about the Ghana-Nigeria expulsion crisis and its impact on ordinary citizens.",
        category: "african_prose",
        is_premium: false,
        total_chapters: 8,
      },
      {
        title: "Faceless",
        author: "Amma Darko",
        description: "A gripping story about street children in Accra, exploring themes of poverty, survival, and hope.",
        category: "african_prose",
        is_premium: false,
        total_chapters: 7,
      },
      {
        title: "Native Son",
        author: "Richard Wright",
        description: "A groundbreaking novel exploring race relations, fear, and violence in 1930s Chicago.",
        category: "non_african_prose",
        is_premium: false,
        total_chapters: 12,
      },
      {
        title: "Wuthering Heights",
        author: "Emily Brontë",
        description: "A classic tale of passionate love, revenge, and the destructive nature of obsession.",
        category: "non_african_prose",
        is_premium: false,
        total_chapters: 15,
      },
      {
        title: "The Lion and the Jewel",
        author: "Wole Soyinka",
        description: "A comedic play exploring tradition versus modernity in a Nigerian village.",
        category: "african_drama",
        is_premium: false,
        total_chapters: 3,
      },
      {
        title: "Look Back in Anger",
        author: "John Osborne",
        description: "A landmark play that sparked the 'Angry Young Men' movement in British theatre.",
        category: "non_african_drama",
        is_premium: false,
        total_chapters: 3,
      },
    ];

    for (const novel of novels) {
      const { data: existing } = await supabase
        .from('novels')
        .select('id')
        .eq('title', novel.title)
        .maybeSingle();

      if (!existing) {
        const { data: insertedNovel, error } = await supabase
          .from('novels')
          .insert(novel)
          .select()
          .single();

        if (insertedNovel) {
          // Add sample chapter with likely questions
          await supabase.from('novel_chapters').insert({
            novel_id: insertedNovel.id,
            chapter_number: 1,
            title: "Introduction & Summary",
            content: `Welcome to "${novel.title}" by ${novel.author}.\n\n${novel.description}\n\nThis chapter provides an overview of the key themes, characters, and plot elements you need to know for JAMB.`,
            word_count: 500,
            estimated_reading_time: 5,
            likely_questions: [
              {
                question: `Who is the author of "${novel.title}"?`,
                options: [novel.author, "Chinua Achebe", "Wole Soyinka", "Chimamanda Adichie"],
                correct_answer: 0,
                explanation: `${novel.title} was written by ${novel.author}.`
              }
            ]
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Novels seeded successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error seeding novels:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

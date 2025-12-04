import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, fileType, subject } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing upload for subject:', subject, 'file type:', fileType);

    const systemPrompt = `You are an expert JAMB exam question extractor. Your job is to extract ALL questions from JAMB past question papers.

For each question found, extract:
1. The question text (clean it up, fix typos)
2. All 4 options (A, B, C, D)
3. The correct answer letter
4. A brief explanation of why that answer is correct
5. For Math/Physics questions: provide step-by-step solution

Return a JSON array of questions in this EXACT format:
{
  "questions": [
    {
      "question": "The question text here",
      "option_a": "First option",
      "option_b": "Second option", 
      "option_c": "Third option",
      "option_d": "Fourth option",
      "correct_answer": "A",
      "explanation": "Brief explanation of why A is correct",
      "year": 2023,
      "subject": "${subject}"
    }
  ],
  "total_found": 10,
  "message": "Great upload! Found 10 questions. Let's smash these together! 🔥"
}

Be thorough - extract EVERY question visible. If text is unclear, make your best guess.
Always be encouraging and motivational in the message!`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract all JAMB ${subject} questions from this ${fileType}. Be thorough and extract every question you can see.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Too many requests! Take a short break and try again in a minute. 😊' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI processing limit reached. Contact support!' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log('AI Response received, parsing...');

    // Parse the JSON from the response
    let parsedResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      parsedResult = {
        questions: [],
        total_found: 0,
        message: "Hmm, couldn't extract questions clearly. Try a clearer photo! 📸"
      };
    }

    // Save questions to Supabase if any were found
    if (parsedResult.questions && parsedResult.questions.length > 0) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Insert questions to cache
      const questionsToInsert = parsedResult.questions.map((q: any) => ({
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        year: q.year || 2023,
        subject: subject.toLowerCase()
      }));

      const { error: insertError } = await supabase
        .from('jamb_questions')
        .upsert(questionsToInsert, { onConflict: 'question' });

      if (insertError) {
        console.log('Note: Some questions may already exist:', insertError.message);
      }
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Processing failed. Try again!',
      questions: [],
      total_found: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

function getUserIdentifier(req: Request, email?: string): string {
  if (email) return email;
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ip:${ip}`;
}

function buildSystemPrompt(subject: string): string {
  return `You are an expert JAMB exam question extractor. Your job is to extract ALL questions from JAMB past question papers.

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
}

function parseAIResponse(content: string): { questions: ExtractedQuestion[]; total_found: number; message?: string } {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as { questions: ExtractedQuestion[]; total_found: number };
    throw new Error('No JSON found');
  } catch {
    return {
      questions: [],
      total_found: 0,
      message: "Hmm, couldn't extract questions clearly. Try a clearer photo! 📸"
    };
  }
}

interface ExtractedQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  year?: number;
}

async function saveQuestions(questions: ExtractedQuestion[], subject: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const questionsToInsert = questions.map((q) => ({
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

  const { error } = await supabase
    .from('jamb_questions')
    .upsert(questionsToInsert, { onConflict: 'question' });

  if (error) console.log('Some questions may already exist:', error.message);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    if (body.test === true) {
      return new Response(JSON.stringify({ status: 'ok', message: 'Process upload function is working!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageBase64, fileType, subject, email } = body;

    const userIdentifier = getUserIdentifier(req, email);
    if (isRateLimited(userIdentifier)) {
      return new Response(
        JSON.stringify({ error: 'Too many uploads! Max 10 per hour. Please wait. 😊', rate_limited: true }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');

    console.log('Processing upload for subject:', subject, 'file type:', fileType, 'user:', userIdentifier);

    const systemPrompt = buildSystemPrompt(subject);

    // Build the content array based on file type
    const userContent: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [
      {
        type: 'text',
        text: `Extract all JAMB ${subject} questions from this ${fileType}. Be thorough and extract every question you can see.`
      }
    ];

    // For both images and PDFs, send as image_url with the base64 data
    // Gemini models support PDF via base64 data URI
    if (fileType === 'PDF') {
      // Ensure proper data URI for PDF
      const pdfData = imageBase64.startsWith('data:') 
        ? imageBase64 
        : `data:application/pdf;base64,${imageBase64}`;
      userContent.push({
        type: 'image_url',
        image_url: { url: pdfData }
      });
    } else {
      // Image file
      const imageData = imageBase64.startsWith('data:') 
        ? imageBase64 
        : `data:image/jpeg;base64,${imageBase64}`;
      userContent.push({
        type: 'image_url',
        image_url: { url: imageData }
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Too many requests! Try again in a minute. 😊' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI processing limit reached. Contact support!' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    console.log('AI Response received, parsing...');

    const parsedResult = parseAIResponse(content);

    if (parsedResult.questions?.length > 0) {
      await saveQuestions(parsedResult.questions, subject);
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

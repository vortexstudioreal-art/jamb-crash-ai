import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudyData {
  avgScore: number;
  totalQuizzes: number;
  weakestSubject: string | null;
  weakestScore: number | null;
  strongestSubject: string | null;
  strongestScore: number | null;
  streak: number;
  totalTimeMinutes: number;
  lastQuizScore: number | null;
  predictedJAMB: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
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

    const { studyData } = await req.json() as { studyData: StudyData };

    if (!studyData || studyData.totalQuizzes === 0) {
      return new Response(
        JSON.stringify({ 
          tip: "Ready to crush JAMB? Start your first quiz now and I'll give you personalized study tips! 🚀",
          predictedScore: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context for AI
    const context = `
Student JAMB Preparation Stats:
- Average Quiz Score: ${studyData.avgScore}%
- Total Quizzes Completed: ${studyData.totalQuizzes}
- Study Streak: ${studyData.streak} consecutive days
- Total Study Time: ${studyData.totalTimeMinutes} minutes
- Predicted JAMB Score: ${studyData.predictedJAMB}/400
${studyData.weakestSubject ? `- Weakest Subject: ${studyData.weakestSubject} (${studyData.weakestScore}%)` : ''}
${studyData.strongestSubject ? `- Strongest Subject: ${studyData.strongestSubject} (${studyData.strongestScore}%)` : ''}
${studyData.lastQuizScore !== null ? `- Most Recent Quiz Score: ${studyData.lastQuizScore}%` : ''}
`;

    const prompt = `You are an expert JAMB tutor helping Nigerian students prepare for their UTME examination. Based on the following student's performance data, provide ONE personalized, actionable study tip that will help them improve their score.

${context}

Requirements:
1. Be specific and actionable (e.g., "Practice 20 Physics questions on Motion today" not just "study more")
2. Reference their actual performance data (mention specific subjects and percentages)
3. Be encouraging but honest
4. Keep it to 2-3 sentences maximum
5. Use Nigerian student-friendly language
6. Include one relevant emoji at the end

Provide only the tip, nothing else.`;

    // Call Groq AI
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const tip = data.choices?.[0]?.message?.content?.trim() || getFallbackTip(studyData);

    // Calculate a more nuanced predicted score
    const predictedScoreRange = {
      min: Math.round((studyData.avgScore / 100) * 400 * 0.9),
      max: Math.round((studyData.avgScore / 100) * 400 * 1.1),
      likely: studyData.predictedJAMB
    };

    // Adjust based on streak and consistency
    if (studyData.streak >= 7) {
      predictedScoreRange.max = Math.min(400, predictedScoreRange.max + 15);
    }
    if (studyData.totalQuizzes >= 20) {
      predictedScoreRange.min = Math.max(0, predictedScoreRange.min + 10);
    }

    return new Response(
      JSON.stringify({ 
        tip,
        predictedScore: predictedScoreRange,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating study tip:', error);
    
    // Return fallback tip
    return new Response(
      JSON.stringify({ 
        tip: "Keep up the consistent practice! Focus on your weak areas and you'll see improvement. 💪",
        predictedScore: null,
        error: 'Used fallback tip'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getFallbackTip(data: StudyData): string {
  if (data.weakestSubject && data.weakestScore && data.weakestScore < 50) {
    return `Your ${data.weakestSubject} needs attention at ${data.weakestScore}%. Practice 20 questions in this subject today to boost your overall score! 📈`;
  }
  if (data.avgScore >= 70) {
    return `Excellent work! Your ${data.avgScore}% average puts you on track for ${data.predictedJAMB}+. Keep the momentum going! 🔥`;
  }
  return `You've completed ${data.totalQuizzes} quizzes. Aim for one more today to build consistency and hit your target score! 💪`;
}
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('To', `whatsapp:${to}`);
  formData.append('From', `whatsapp:${TWILIO_PHONE_NUMBER}`);
  formData.append('Body', message);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  const result = await response.json();
  console.log('Twilio response:', result);
  
  return response.ok;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone_number, email, test_mode } = await req.json();

    // Validate Twilio credentials
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ error: 'Twilio not configured', configured: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If test mode, just verify credentials work
    if (test_mode) {
      console.log('Test mode - checking Twilio configuration');
      return new Response(
        JSON.stringify({ 
          success: true, 
          configured: true,
          message: 'Twilio is configured correctly' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's study data from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's subjects and progress
    const { data: userSubjects } = await supabase
      .from('user_subjects')
      .select('subjects')
      .eq('email', email)
      .single();

    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('email', email)
      .single();

    // Fetch 3 random questions from their subjects
    let questionsMessage = '';
    if (userSubjects?.subjects && userSubjects.subjects.length > 0) {
      const randomSubject = userSubjects.subjects[Math.floor(Math.random() * userSubjects.subjects.length)];
      
      const { data: questions } = await supabase
        .from('jamb_questions')
        .select('question, option_a, option_b, option_c, option_d, correct_answer')
        .eq('subject', randomSubject)
        .limit(3);

      if (questions && questions.length > 0) {
        questionsMessage = '\n\n📚 *Quick Practice Questions:*\n';
        questions.forEach((q, i) => {
          questionsMessage += `\n${i + 1}. ${q.question}\nA) ${q.option_a}\nB) ${q.option_b}\nC) ${q.option_c}\nD) ${q.option_d}\n`;
        });
      }
    }

    // Build the reminder message
    const greetings = ['Good morning! 🌅', 'Rise and shine! ☀️', 'Hello champion! 🏆'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    const studyDays = progress?.study_days_completed || 0;
    const questionsCompleted = progress?.questions_completed || 0;
    
    const message = `${greeting}

🎯 *JAMB 48-Hour Crash - Daily Reminder*

📊 Your Progress:
• Study Days: ${studyDays} days
• Questions Completed: ${questionsCompleted}
${progress?.predicted_score_min ? `• Predicted Score: ${progress.predicted_score_min}-${progress.predicted_score_max}` : ''}

💪 Keep pushing! Every question brings you closer to that 300+ score!
${questionsMessage}

📱 Open the app to continue your study session!`;

    // Send the WhatsApp message
    const success = await sendWhatsAppMessage(phone_number, message);

    if (success) {
      console.log(`WhatsApp reminder sent to ${phone_number}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Reminder sent successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Failed to send WhatsApp message');
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending WhatsApp reminder:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

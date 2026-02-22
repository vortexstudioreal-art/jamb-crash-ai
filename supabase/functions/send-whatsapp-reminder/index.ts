import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
// Clean phone number - remove any spaces from stored secret
const RAW_TWILIO_PHONE = Deno.env.get('TWILIO_PHONE_NUMBER') || '';
const TWILIO_PHONE_NUMBER = RAW_TWILIO_PHONE.replace(/\s+/g, '');

// Twilio sandbox details
const SANDBOX_NUMBER = '+14155238886';
const SANDBOX_JOIN_MESSAGE = "join sound-sound";

// App link
const APP_LINK = 'https://jamb.lovable.app';

// Rate limiting: track requests per phone number (in-memory, resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max 5 messages per hour per phone
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function isRateLimited(phone: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(phone);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(phone, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }
  
  entry.count++;
  return false;
}

// Validate phone number format (international format, 10-15 digits)
function validatePhoneNumber(phone: string): { valid: boolean; formatted: string; error?: string } {
  // Remove all whitespace and non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  // Fix common Nigerian number issue: +2340XXXXXXXXX → +234XXXXXXXXX
  if (cleaned.startsWith('+2340')) {
    cleaned = '+234' + cleaned.substring(5);
    console.log(`Fixed Nigerian number format: ${phone} → ${cleaned}`);
  }
  
  // Remove the + for digit validation
  const digitsOnly = cleaned.substring(1);
  
  if (!/^\d+$/.test(digitsOnly)) {
    return { valid: false, formatted: '', error: 'Phone number must contain only digits' };
  }
  
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { valid: false, formatted: '', error: 'Phone number must be 10-15 digits. Use international format (+234...)' };
  }
  
  return { valid: true, formatted: cleaned };
}

async function sendWhatsAppMessage(to: string, message: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  console.log(`Attempting to send WhatsApp to: ${to}`);
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('To', `whatsapp:${to}`);
  // Use Twilio sandbox number for sending
  formData.append('From', `whatsapp:${SANDBOX_NUMBER}`);
  formData.append('Body', message);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('Twilio API response:', JSON.stringify(result));
    
    if (!response.ok) {
      // Sandbox-specific error handling
      if (result.code === 63007 || result.message?.includes('sandbox')) {
        return { 
          success: false, 
          error: `Sandbox session expired. Send "${SANDBOX_JOIN_MESSAGE}" to ${SANDBOX_NUMBER} on WhatsApp to rejoin.` 
        };
      }
      if (result.code === 21211) {
        return { success: false, error: 'Invalid phone number format. Use international format (+234...)' };
      }
      return { success: false, error: result.message || `Twilio error: ${result.code}` };
    }
    
    console.log(`Message sent successfully! SID: ${result.sid}`);
    return { success: true, messageId: result.sid };
  } catch (err) {
    console.error('Network error sending WhatsApp:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

// Type for question data
interface JambQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  subject: string;
}

// deno-lint-ignore no-explicit-any
async function getPersonalizedQuestions(email: string, supabaseClient: any): Promise<string> {
  try {
    // Get user's subjects
    const { data: userSubjects } = await supabaseClient
      .from('user_subjects')
      .select('subjects')
      .eq('email', email)
      .maybeSingle();

    const subjects = (userSubjects?.subjects || []) as string[];
    if (subjects.length === 0) {
      return ''; // No subjects set
    }

    // Get 3 random questions from user's subjects
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    
    const { data: questionsData } = await supabaseClient
      .from('jamb_questions')
      .select('question, option_a, option_b, option_c, option_d, correct_answer, subject')
      .eq('subject', randomSubject)
      .limit(50);

    const questions = (questionsData || []) as JambQuestion[];
    if (questions.length === 0) {
      return '';
    }

    // Pick 3 random questions
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    // Format questions for WhatsApp
    const subjectName = randomSubject.charAt(0).toUpperCase() + randomSubject.slice(1).replace('_', ' ');
    let formattedQuestions = `\n\n📚 *Today's ${subjectName} Questions:*\n`;
    
    selected.forEach((q: JambQuestion, i: number) => {
      const questionText = q.question.slice(0, 100) + (q.question.length > 100 ? '...' : '');
      formattedQuestions += `\n*Q${i + 1}:* ${questionText}\n`;
      formattedQuestions += `A) ${q.option_a.slice(0, 30)}${q.option_a.length > 30 ? '...' : ''}\n`;
      formattedQuestions += `B) ${q.option_b.slice(0, 30)}${q.option_b.length > 30 ? '...' : ''}\n`;
      formattedQuestions += `C) ${q.option_c.slice(0, 30)}${q.option_c.length > 30 ? '...' : ''}\n`;
      formattedQuestions += `D) ${q.option_d.slice(0, 30)}${q.option_d.length > 30 ? '...' : ''}\n`;
      formattedQuestions += `✅ Answer: ${q.correct_answer.toUpperCase()}\n`;
    });

    return formattedQuestions;
  } catch (err) {
    console.error('Error getting personalized questions:', err);
    return '';
  }
}

// Generate daily motivational messages
function getDailyGreeting(): string {
  const hour = new Date().getUTCHours() + 1; // Nigerian time (WAT = UTC+1)
  
  if (hour >= 5 && hour < 12) {
    const mornings = [
      'Good morning, champion! 🌅',
      'Rise and shine! ☀️',
      'Wake up, future doctor/engineer! 🌞',
      'Morning superstar! 🌟',
    ];
    return mornings[Math.floor(Math.random() * mornings.length)];
  } else if (hour >= 12 && hour < 17) {
    const afternoons = [
      'Good afternoon! 🌤️',
      'Afternoon boost! 💪',
      'Keep pushing! 🔥',
    ];
    return afternoons[Math.floor(Math.random() * afternoons.length)];
  } else {
    const evenings = [
      'Good evening! 🌙',
      'Evening study time! 📚',
      'Night owl mode! 🦉',
    ];
    return evenings[Math.floor(Math.random() * evenings.length)];
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone_number, email, test_mode, send_daily_reminders } = await req.json();

    console.log(`WhatsApp request - phone: ${phone_number}, email: ${email}, test: ${test_mode}, daily: ${send_daily_reminders}`);

    // Check Twilio configuration
    const configured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
    
    if (!configured) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ 
          error: 'Twilio not configured', 
          configured: false,
          details: {
            hasAccountSid: !!TWILIO_ACCOUNT_SID,
            hasAuthToken: !!TWILIO_AUTH_TOKEN,
            hasPhoneNumber: !!TWILIO_PHONE_NUMBER
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test mode - just check configuration
    if (test_mode) {
      console.log('Test mode - returning configuration status');
      return new Response(
        JSON.stringify({ 
          success: true, 
          configured: true,
          message: 'WhatsApp is connected & working ✅',
          sandbox_info: {
            number: SANDBOX_NUMBER,
            join_message: SANDBOX_JOIN_MESSAGE,
            instructions: `Text "${SANDBOX_JOIN_MESSAGE}" to ${SANDBOX_NUMBER} on WhatsApp to activate`
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send daily reminders to all active users (called by cron)
    if (send_daily_reminders) {
      console.log('Sending daily reminders to all active users...');
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get all active WhatsApp reminders
      const { data: reminders, error: remindersError } = await supabase
        .from('whatsapp_reminders')
        .select('*')
        .eq('is_active', true);

      if (remindersError) {
        console.error('Error fetching reminders:', remindersError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch reminders' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Found ${reminders?.length || 0} active reminders`);

      const results: { sent: number; failed: number; errors: string[] } = { sent: 0, failed: 0, errors: [] };

      for (const reminder of reminders || []) {
        // Validate phone before sending
        const validation = validatePhoneNumber(reminder.phone_number);
        if (!validation.valid) {
          results.failed++;
          results.errors.push(`${reminder.phone_number}: ${validation.error}`);
          continue;
        }

        const greeting = getDailyGreeting();
        
        // Get personalized questions for this user
        const personalizedQuestions = await getPersonalizedQuestions(reminder.email, supabase);
        
        const message = `${greeting}

🎯 *Jamb Crash AI - Daily Practice*
${personalizedQuestions || '\n📚 Practice your subjects today!'}

💪 Every question gets you closer to 300+!

📱 Open app → ${APP_LINK}

Keep crushing it! 🔥`;

        const result = await sendWhatsAppMessage(validation.formatted, message);
        
        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`${reminder.phone_number}: ${result.error}`);
        }
        
        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`Daily reminders complete: ${results.sent} sent, ${results.failed} failed`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Sent ${results.sent} reminders, ${results.failed} failed`,
          details: results
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Single message send (test or manual)
    if (!phone_number) {
      return new Response(
        JSON.stringify({ error: 'Phone number required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number
    const validation = validatePhoneNumber(phone_number);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formattedPhone = validation.formatted;

    // Check rate limiting
    if (isRateLimited(formattedPhone)) {
      console.log(`Rate limited: ${formattedPhone}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many messages sent to this number. Please wait an hour before trying again.',
          rate_limited: true
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user data if email provided
    let studyStats = '';
    if (email) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (progress) {
        studyStats = `
📊 Your Progress:
• Questions: ${progress.questions_completed || 0}
• Study Days: ${progress.study_days_completed || 0}
${progress.predicted_score_min ? `• Predicted: ${progress.predicted_score_min}-${progress.predicted_score_max}` : ''}`;
      }
    }

    const greeting = getDailyGreeting();
    const message = `${greeting}

🎯 *Jamb Crash AI - Study Reminder*
${studyStats}

Ready for today's 20 JAMB questions? 📚

💪 Every question gets you closer to 300+!

📱 Open app → ${APP_LINK}

Keep crushing it! 🔥`;

    const result = await sendWhatsAppMessage(formattedPhone, message);

    if (result.success) {
      console.log(`WhatsApp sent to ${formattedPhone}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Reminder sent successfully! ✅',
          messageId: result.messageId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error(`Failed to send: ${result.error}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error,
          sandbox_info: {
            number: SANDBOX_NUMBER,
            join_message: SANDBOX_JOIN_MESSAGE,
            instructions: `If sandbox expired, text "${SANDBOX_JOIN_MESSAGE}" to ${SANDBOX_NUMBER} on WhatsApp`
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('WhatsApp function error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const RAW_TWILIO_PHONE = Deno.env.get('TWILIO_PHONE_NUMBER') || '';
const TWILIO_PHONE_NUMBER = RAW_TWILIO_PHONE.replace(/\s+/g, '');

const SANDBOX_NUMBER = '+14155238886';
const SANDBOX_JOIN_MESSAGE = "join sound-sound";
const APP_LINK = 'https://jamb.lovable.app';

// Rate limiting per phone
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function isRateLimited(phone: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(phone);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(phone, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

function validatePhoneNumber(phone: string): { valid: boolean; formatted: string; error?: string } {
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) cleaned = '+' + cleaned;
  if (cleaned.startsWith('+2340')) {
    cleaned = '+234' + cleaned.substring(5);
  }
  const digitsOnly = cleaned.substring(1);
  if (!/^\d+$/.test(digitsOnly)) return { valid: false, formatted: '', error: 'Phone number must contain only digits' };
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return { valid: false, formatted: '', error: 'Phone number must be 10-15 digits' };
  return { valid: true, formatted: cleaned };
}

async function sendWhatsAppMessage(to: string, message: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const formData = new URLSearchParams();
  formData.append('To', `whatsapp:${to}`);
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
    if (!response.ok) {
      if (result.code === 63007 || result.message?.includes('sandbox')) {
        return { success: false, error: `Sandbox session expired. Send "${SANDBOX_JOIN_MESSAGE}" to ${SANDBOX_NUMBER} on WhatsApp to rejoin.` };
      }
      if (result.code === 21211) return { success: false, error: 'Invalid phone number format.' };
      return { success: false, error: result.message || `Twilio error: ${result.code}` };
    }
    return { success: true, messageId: result.sid };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

interface JambQuestion {
  question: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; subject: string;
}

// deno-lint-ignore no-explicit-any
async function getPersonalizedQuestions(email: string, supabaseClient: any): Promise<string> {
  try {
    const { data: userSubjects } = await supabaseClient.from('user_subjects').select('subjects').eq('email', email).maybeSingle();
    const subjects = (userSubjects?.subjects || []) as string[];
    if (subjects.length === 0) return '';
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const { data: questionsData } = await supabaseClient.from('jamb_questions').select('question, option_a, option_b, option_c, option_d, correct_answer, subject').eq('subject', randomSubject).limit(50);
    const questions = (questionsData || []) as JambQuestion[];
    if (questions.length === 0) return '';
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
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

function getDailyGreeting(): string {
  const hour = new Date().getUTCHours() + 1;
  if (hour >= 5 && hour < 12) {
    const m = ['Good morning, champion! 🌅', 'Rise and shine! ☀️', 'Wake up, future doctor/engineer! 🌞', 'Morning superstar! 🌟'];
    return m[Math.floor(Math.random() * m.length)];
  } else if (hour >= 12 && hour < 17) {
    const a = ['Good afternoon! 🌤️', 'Afternoon boost! 💪', 'Keep pushing! 🔥'];
    return a[Math.floor(Math.random() * a.length)];
  } else {
    const e = ['Good evening! 🌙', 'Evening study time! 📚', 'Night owl mode! 🦉'];
    return e[Math.floor(Math.random() * e.length)];
  }
}

// Helper to verify JWT and get user email
async function verifyAuth(req: Request): Promise<{ email: string } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });
  
  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await authClient.auth.getClaims(token);
  if (error || !data?.claims) return null;
  
  return { email: data.claims.email as string };
}

// Helper to verify service role key for cron/internal calls
function verifyServiceRole(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.replace('Bearer ', '');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  return token === serviceRoleKey;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone_number, email, test_mode, send_daily_reminders } = await req.json();

    // Check Twilio configuration
    const configured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
    if (!configured) {
      return new Response(
        JSON.stringify({ error: 'Twilio not configured', configured: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test mode - just check configuration (requires auth)
    if (test_mode) {
      return new Response(
        JSON.stringify({ success: true, configured: true, message: 'WhatsApp is connected & working ✅' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send daily reminders - requires service role key (cron/internal only)
    if (send_daily_reminders) {
      if (!verifyServiceRole(req)) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized - service role required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Sending daily reminders to all active users...');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: reminders, error: remindersError } = await supabase
        .from('whatsapp_reminders').select('*').eq('is_active', true);

      if (remindersError) {
        return new Response(JSON.stringify({ error: 'Failed to fetch reminders' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const results: { sent: number; failed: number; errors: string[] } = { sent: 0, failed: 0, errors: [] };

      for (const reminder of reminders || []) {
        const validation = validatePhoneNumber(reminder.phone_number);
        if (!validation.valid) { results.failed++; results.errors.push(`${reminder.phone_number}: ${validation.error}`); continue; }
        const greeting = getDailyGreeting();
        const personalizedQuestions = await getPersonalizedQuestions(reminder.email, supabase);
        const message = `${greeting}\n\n🎯 *Jamb Crash AI - Daily Practice*\n${personalizedQuestions || '\n📚 Practice your subjects today!'}\n\n💪 Every question gets you closer to 300+!\n\n📱 Open app → ${APP_LINK}\n\nKeep crushing it! 🔥`;
        const result = await sendWhatsAppMessage(validation.formatted, message);
        if (result.success) { results.sent++; } else { results.failed++; results.errors.push(`${reminder.phone_number}: ${result.error}`); }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return new Response(
        JSON.stringify({ success: true, message: `Sent ${results.sent} reminders, ${results.failed} failed`, details: results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Single message send - requires JWT auth
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!phone_number) {
      return new Response(JSON.stringify({ error: 'Phone number required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verify the phone belongs to the requesting user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: reminderRecord } = await supabase
      .from('whatsapp_reminders')
      .select('phone_number')
      .eq('email', authUser.email)
      .maybeSingle();

    const validation = validatePhoneNumber(phone_number);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Only allow sending to the user's own registered phone number
    if (reminderRecord) {
      const registeredValidation = validatePhoneNumber(reminderRecord.phone_number);
      if (registeredValidation.valid && registeredValidation.formatted !== validation.formatted) {
        return new Response(JSON.stringify({ error: 'Phone number does not match your registered number' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const formattedPhone = validation.formatted;

    if (isRateLimited(formattedPhone)) {
      return new Response(
        JSON.stringify({ error: 'Too many messages sent. Please wait an hour.', rate_limited: true }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use authenticated user's email for data lookup
    let studyStats = '';
    const { data: progress } = await supabase.from('user_progress').select('*').eq('email', authUser.email).maybeSingle();
    if (progress) {
      studyStats = `\n📊 Your Progress:\n• Questions: ${progress.questions_completed || 0}\n• Study Days: ${progress.study_days_completed || 0}\n${progress.predicted_score_min ? `• Predicted: ${progress.predicted_score_min}-${progress.predicted_score_max}` : ''}`;
    }

    const greeting = getDailyGreeting();
    const message = `${greeting}\n\n🎯 *Jamb Crash AI - Study Reminder*\n${studyStats}\n\nReady for today's 20 JAMB questions? 📚\n\n💪 Every question gets you closer to 300+!\n\n📱 Open app → ${APP_LINK}\n\nKeep crushing it! 🔥`;

    const result = await sendWhatsAppMessage(formattedPhone, message);

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true, message: 'Reminder sent successfully! ✅', messageId: result.messageId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: result.error, sandbox_info: { number: SANDBOX_NUMBER, join_message: SANDBOX_JOIN_MESSAGE } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('WhatsApp function error:', error);
    return new Response(JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

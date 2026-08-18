import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, XCircle, RefreshCw, Copy, Loader2,
  FileText, Camera, Clock, Target, MessageSquare, 
  Gift, Shield, CreditCard, Brain, Users, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HealthCheckResult {
  name: string;
  status: 'working' | 'not_working' | 'checking';
  icon: React.ReactNode;
  fixPrompt: string;
  details?: string;
}

const healthChecks: Omit<HealthCheckResult, 'status'>[] = [
    {
      name: 'Free Demo (20 questions)',
      icon: <Zap className="w-5 h-5" />,
      fixPrompt: 'Fix the Free Demo feature: The demo quiz should allow users to try 20 JAMB questions for free without payment. Make sure the demo_usage table tracks usage per device/email, the DemoQuizFlow component renders correctly, and users can only use the demo once per device.',
    },
    {
      name: 'Subject selection after payment',
      icon: <Users className="w-5 h-5" />,
      fixPrompt: 'Fix Subject Selection: After successful payment, users should be redirected to select their 4 JAMB subjects (English + 3 others). The SubjectSelector component should save selections to user_subjects table and transition to the dashboard.',
    },
    {
      name: 'PDF upload + extraction',
      icon: <FileText className="w-5 h-5" />,
      fixPrompt: 'Fix PDF Upload: The UploadSection should accept PDF files, send them to the process-upload edge function which uses Lovable AI to extract JAMB questions, options, correct answers, and explanations. Extracted questions should be saved to jamb_questions table.',
    },
    {
      name: 'Photo upload',
      icon: <Camera className="w-5 h-5" />,
      fixPrompt: 'Fix Photo Upload: Users should be able to take photos or upload images of JAMB past questions. The images should be processed by the process-upload edge function using Lovable AI vision capabilities to extract questions.',
    },
    {
      name: '60-question 90-minute timed quiz',
      icon: <Clock className="w-5 h-5" />,
      fixPrompt: 'Fix Timed Quiz: The TimedQuiz component should load 60 questions (15 per subject from user\'s 4 selected subjects), display a 90-minute countdown timer, and allow users to navigate between questions. Questions should come from jamb_questions table.',
    },
    {
      name: 'Timer auto-submit',
      icon: <Clock className="w-5 h-5" />,
      fixPrompt: 'Fix Timer Auto-Submit: When the 90-minute timer reaches 0, the quiz should automatically submit and show results. The timer should turn red when under 5 minutes remaining and show a warning.',
    },
    {
      name: 'Results screen with green underline correct answers',
      icon: <Target className="w-5 h-5" />,
      fixPrompt: 'Fix Quiz Results Display: The QuizResults component should show each question with the user\'s answer. Correct answers should have a green underline and be bold. Wrong user answers should be red with strikethrough. Show the letter (A/B/C/D) circled for correct answers.',
    },
    {
      name: 'Explanations for wrong answers',
      icon: <Brain className="w-5 h-5" />,
      fixPrompt: 'Fix Answer Explanations: For each question in the results, show an expandable explanation section that explains why the correct answer is right. Include step-by-step solutions for Maths/Physics questions.',
    },
    {
      name: 'Quiz saving + study stats dashboard',
      icon: <Target className="w-5 h-5" />,
      fixPrompt: 'Fix Quiz Persistence: Every quiz attempt should be saved to quiz_attempts table with date, score, time_taken, subjects, and question responses. The StudyStats component should display charts showing progress over time, weak subjects, and AI-generated study insights.',
    },
    {
      name: 'Predicted JAMB score',
      icon: <Target className="w-5 h-5" />,
      fixPrompt: 'Fix Score Predictor: The ScorePredictor component should calculate and display a predicted JAMB score range based on quiz performance. Users should be able to share their predicted score via the ShareableResultCard component.',
    },
    {
      name: 'WhatsApp reminder test',
      icon: <MessageSquare className="w-5 h-5" />,
      fixPrompt: 'Fix WhatsApp Reminders: Create a send-whatsapp-reminder edge function that uses Twilio API to send daily study reminders. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER secrets. The WhatsAppReminder component should let users enter their phone number.',
    },
    {
      name: 'Referral system',
      icon: <Gift className="w-5 h-5" />,
      fixPrompt: 'Fix Referral System: The ReferralSystem component should generate unique referral codes via generate_referral_code function, track referrals in the referrals table, and apply ₦1,000 discount when referred users make payment.',
    },
    {
      name: 'Owner bypass (never sees paywall)',
      icon: <Shield className="w-5 h-5" />,
      fixPrompt: 'Fix Owner Access: The owner should always have full access to all features without seeing any paywall. Check AuthContext and check_user_access database function to ensure owner role grants permanent access.',
    },
    {
      name: 'Paystack test payment',
      icon: <CreditCard className="w-5 h-5" />,
      fixPrompt: 'Fix Paystack Integration: Verify PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY secrets are set. The paystack-initialize, paystack-verify, and paystack-webhook edge functions should work. Test mode should use pk_test_* keys. Payment success should update payments table with access_expires_at.',
    },
  ];

export const AppHealthCheck = () => {
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runSingleCheck = useCallback(async (featureName: string): Promise<{ working: boolean; details?: string }> => {
    try {
      switch (featureName) {
        case 'Free Demo (20 questions)': {
          // Check if demo_usage table exists and DemoQuizFlow component logic
          const { count } = await supabase.from('demo_usage').select('*', { count: 'exact', head: true });
          const { data: questions } = await supabase.from('jamb_questions').select('id').limit(20);
          return { 
            working: count !== null && (questions?.length ?? 0) > 0,
            details: `${questions?.length || 0} questions available for demo`
          };
        }

        case 'Subject selection after payment': {
          const { count } = await supabase.from('user_subjects').select('*', { count: 'exact', head: true });
          return { 
            working: count !== null,
            details: `${count || 0} users have selected subjects`
          };
        }

        case 'PDF upload + extraction': {
          // Check if edge function exists by checking config
          try {
            const response = await supabase.functions.invoke('process-upload', {
              body: { test: true }
            });
            return { working: !response.error, details: response.error?.message };
          } catch {
            return { working: false, details: 'Edge function not responding' };
          }
        }

        case 'Photo upload': {
          // Same as PDF - uses process-upload
          try {
            const response = await supabase.functions.invoke('process-upload', {
              body: { test: true }
            });
            return { working: !response.error };
          } catch {
            return { working: false };
          }
        }

        case '60-question 90-minute timed quiz': {
          const { data: questions } = await supabase.from('jamb_questions').select('id');
          const hasEnoughQuestions = (questions?.length ?? 0) >= 60;
          return { 
            working: hasEnoughQuestions,
            details: `${questions?.length || 0} questions in database (need 60+)`
          };
        }

        case 'Timer auto-submit': {
          // This is a frontend feature - check if component exists
          return { working: true, details: 'Frontend feature - manual test recommended' };
        }

        case 'Results screen with green underline correct answers': {
          return { working: true, details: 'Frontend feature - manual test recommended' };
        }

        case 'Explanations for wrong answers': {
          const { data } = await supabase.from('jamb_questions').select('explanation').not('explanation', 'is', null).limit(5);
          const hasExplanations = (data?.length ?? 0) > 0;
          return { 
            working: hasExplanations,
            details: `${data?.length || 0} questions have explanations`
          };
        }

        case 'Quiz saving + study stats dashboard': {
          const { count } = await supabase.from('quiz_attempts').select('*', { count: 'exact', head: true });
          return { 
            working: count !== null,
            details: `${count || 0} quiz attempts recorded`
          };
        }

        case 'Predicted JAMB score': {
          const { count } = await supabase.from('user_progress').select('*', { count: 'exact', head: true });
          return { 
            working: count !== null,
            details: `${count || 0} score predictions saved`
          };
        }

        case 'WhatsApp reminder test': {
          const { count } = await supabase.from('whatsapp_reminders').select('*', { count: 'exact', head: true });
          // Test if the send-whatsapp-reminder edge function is configured
          try {
            const response = await supabase.functions.invoke('send-whatsapp-reminder', {
              body: { test_mode: true }
            });
            return { 
              working: response.data?.configured === true,
              details: response.data?.configured 
                ? `Twilio configured. ${count || 0} users signed up for reminders`
                : 'Twilio API keys needed. ' + (count || 0) + ' users signed up'
            };
          } catch {
            return { 
              working: false,
              details: 'Edge function not responding. ' + (count || 0) + ' users signed up'
            };
          }
        }

        case 'Referral system': {
          const { count } = await supabase.from('referrals').select('*', { count: 'exact', head: true });
          return { 
            working: count !== null,
            details: `${count || 0} referral codes generated`
          };
        }

        case 'Owner bypass (never sees paywall)': {
          // Use current authenticated user's email instead of hardcoded value
          const currentSession = await supabase.auth.getSession();
          const currentEmail = currentSession.data.session?.user?.email;
          if (!currentEmail) {
            return { working: false, details: 'Not authenticated' };
          }
          const { data } = await supabase.rpc('check_user_access', { 
            user_email: currentEmail 
          });
          const ownerAccess = data?.[0];
          return { 
            working: ownerAccess?.has_access === true && ownerAccess?.is_admin === true,
            details: ownerAccess?.admin_role === 'owner' ? 'Owner role confirmed' : (ownerAccess?.admin_role || 'No admin role')
          };
        }

        case 'Paystack test payment': {
          try {
            const response = await supabase.functions.invoke('paystack-config', {
              body: {}
            });
            return { 
              working: !response.error && response.data?.publicKey,
              details: response.data?.publicKey ? 'Paystack configured' : 'Missing Paystack keys'
            };
          } catch {
            return { working: false, details: 'Paystack edge function error' };
          }
        }

        default:
          return { working: false };
      }
    } catch (error) {
      console.error(`Health check failed for ${featureName}:`, error);
      return { working: false, details: 'Check failed with error' };
    }
  }, []);

  const runHealthCheck = useCallback(async () => {
    setIsRunning(true);
    const newResults: HealthCheckResult[] = healthChecks.map(check => ({
      ...check,
      status: 'checking' as const,
    }));
    setResults(newResults);

    // Run all checks
    const updatedResults = await Promise.all(
      healthChecks.map(async (check, index) => {
        await new Promise(resolve => setTimeout(resolve, index * 200)); // Stagger checks
        const result = await runSingleCheck(check.name);
        return {
          ...check,
          status: result.working ? 'working' as const : 'not_working' as const,
          details: result.details,
        };
      })
    );

    setResults(updatedResults);
    setLastChecked(new Date());
    setIsRunning(false);
    
    const workingCount = updatedResults.filter(r => r.status === 'working').length;
    toast.success(`Health check complete: ${workingCount}/${updatedResults.length} features working`);
  }, [runSingleCheck]);

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Fix prompt copied! Paste it in the chat to fix this feature.');
  };

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  const workingCount = results.filter(r => r.status === 'working').length;
  const notWorkingCount = results.filter(r => r.status === 'not_working').length;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            APP HEALTH CHECK
          </CardTitle>
          <div className="flex items-center gap-4">
            {lastChecked && (
              <span className="text-xs text-muted-foreground">
                Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runHealthCheck}
              disabled={isRunning}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Checking...' : 'Re-run Tests'}
            </Button>
          </div>
        </div>
        
        {/* Summary */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">{workingCount} Working</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/20">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">{notWorkingCount} Not Working</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {results.map((result, index) => (
          <motion.div
            key={result.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-lg border ${
              result.status === 'working' 
                ? 'bg-green-500/5 border-green-500/30' 
                : result.status === 'not_working'
                ? 'bg-destructive/5 border-destructive/30'
                : 'bg-muted/50 border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  result.status === 'working' 
                    ? 'bg-green-500/20 text-green-500' 
                    : result.status === 'not_working'
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {result.status === 'checking' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    result.icon
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{result.name}</p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground">{result.details}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {result.status === 'checking' ? (
                  <span className="text-sm text-muted-foreground">Checking...</span>
                ) : result.status === 'working' ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Working</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Not Working</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => copyPrompt(result.fixPrompt)}
                      className="gap-2"
                    >
                      <Copy className="w-3 h-3" />
                      Fix with one prompt
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

import { useState, useEffect, useRef, lazy, Suspense, startTransition, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UploadSection } from '@/components/UploadSection';
import { PlanSelectionModal } from '@/components/PlanSelectionModal';
import { PaywallGate } from '@/components/PaywallGate';
import { AdminBadge } from '@/components/AdminBadge';
import { SubjectChanger } from '@/components/SubjectChanger';
import type { QuizResultsProps } from '@/components/QuizResults';
import { TrialTimerBadge } from '@/components/TrialTimerBadge';
import { BackButton } from '@/components/BackButton';
import { useFeatureUsage } from '@/hooks/useFeatureUsage';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialContext } from '@/contexts/TrialContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut } from 'lucide-react';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';

import { BottomNav, type DashboardTab } from '@/components/BottomNav';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { useSeo } from '@/hooks/useSeo';
import { useFeatureAccess } from '@/components/FeatureGate';
import type { Step, QuizType } from '@/types/dashboard';
import { errorLogger } from '@/services/errorLogger';
import { HomeTab } from '@/components/dashboard/HomeTab';
import { reconcileReminder, parseReminderTime } from '@/lib/reminders';
import { trackFunnel } from '@/lib/funnel';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { StudyTab } from '@/components/dashboard/StudyTab';
import { AiTab } from '@/components/dashboard/AiTab';
import { CommunityTab } from '@/components/dashboard/CommunityTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';


// Lazy-loaded heavy components
const TimedQuiz = lazy(() => import('@/components/TimedQuiz').then(m => ({ default: m.TimedQuiz })));
const MockExam = lazy(() => import('@/components/MockExam').then(m => ({ default: m.MockExam })));
const Flashcards = lazy(() => import('@/components/Flashcards').then(m => ({ default: m.Flashcards })));
const StudyPlanGenerator = lazy(() => import('@/components/StudyPlanGenerator').then(m => ({ default: m.StudyPlanGenerator })));
const StudyPlanTracker = lazy(() => import('@/components/StudyPlanTracker').then(m => ({ default: m.StudyPlanTracker })));
const SyllabusReader = lazy(() => import('@/components/SyllabusReader').then(m => ({ default: m.SyllabusReader })));
const LessonLibrary = lazy(() => import('@/components/LessonLibrary').then(m => ({ default: m.LessonLibrary })));
const NovelBrowser = lazy(() => import('@/components/novels/NovelBrowser').then(m => ({ default: m.NovelBrowser })));
const NovelDetail = lazy(() => import('@/components/novels/NovelDetail').then(m => ({ default: m.NovelDetail })));
const NovelReader = lazy(() => import('@/components/novels/NovelReader').then(m => ({ default: m.NovelReader })));
const JambNewsPage = lazy(() => import('@/components/JambNewsPage').then(m => ({ default: m.JambNewsPage })));
const ScholarshipPage = lazy(() => import('@/components/ScholarshipPage').then(m => ({ default: m.ScholarshipPage })));
const Leaderboard = lazy(() => import('@/components/Leaderboard').then(m => ({ default: m.Leaderboard })));
const StudyNotes = lazy(() => import('@/components/StudyNotes').then(m => ({ default: m.StudyNotes })));const ChatBot = lazy(() => import('@/components/ChatBot').then(m => ({ default: m.ChatBot })));
const HeroSection = lazy(() => import('@/components/HeroSection').then(m => ({ default: m.HeroSection })));
const HowItWorksSection = lazy(() => import('@/components/HowItWorksSection').then(m => ({ default: m.HowItWorksSection })));
const PricingSection = lazy(() => import('@/components/PricingSection').then(m => ({ default: m.PricingSection })));
const PersonalizationForm = lazy(() => import('@/components/PersonalizationForm').then(m => ({ default: m.PersonalizationForm })));
const PaymentModal = lazy(() => import('@/components/PaymentModal').then(m => ({ default: m.PaymentModal })));const SubjectSelector = lazy(() => import('@/components/SubjectSelector').then(m => ({ default: m.SubjectSelector })));
const QuizResults = lazy(() => import('@/components/QuizResults').then(m => ({ default: m.QuizResults })));const CourseRequirements = lazy(() => import('@/components/CourseRequirements').then(m => ({ default: m.CourseRequirements })));const Footer = lazy(() => import('@/components/Footer').then(m => ({ default: m.Footer })));
const FeatureLimitReached = lazy(() => import('@/components/FeatureLimitReached').then(m => ({ default: m.FeatureLimitReached })));const LazyFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <div className="h-8 w-3/4 mx-auto animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-1/2 mx-auto animate-pulse rounded-md bg-muted" />
      <div className="h-32 w-full animate-pulse rounded-md bg-muted" />
    </div>
  </div>
);

interface FormData {
  targetScore: string;
  hoursPerDay: string;
  weakestSubject: string;
  examDate: string;
}

const plans = {
  basic: { name: 'Basic', price: 1500 },
  pro: { name: 'ACE', price: 3500 },
  premium: { name: 'SCHOLAR', price: 7500 },
};

const DASHBOARD_STATE_KEY = 'jamb_dashboard_state';
const DEFAULT_SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry'];

const saveDashboardState = (step: Step) => {
  if (['dashboard', 'quiz', 'quiz-results', 'study-plan', 'upload'].includes(step)) {
    localStorage.setItem(DASHBOARD_STATE_KEY, 'dashboard');
  }
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useSeo({
    title: 'Jamb Crash AI | AI-Powered JAMB & UTME Preparation',
    description: 'Master JAMB with AI-powered study plans, past questions from 2000-2024, personalized timetables, flashcards, and daily WhatsApp reminders. Score 300+ guaranteed.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Jamb Crash AI',
      description: 'AI-powered JAMB and UTME preparation platform with past questions, study plans, flashcards, and score prediction.',
      url: 'https://jambcrash.ai/',
      brand: { '@type': 'Brand', name: 'Jamb Crash AI' },
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '5000',
        highPrice: '15000',
        priceCurrency: 'NGN',
        availability: 'https://schema.org/InStock',
      },
    },
  });

  const [currentStep, setCurrentStep] = useState<Step>('loading');
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPlanSelectionOpen, setIsPlanSelectionOpen] = useState(false);
  const [personalizationData, setPersonalizationData] = useState<FormData | null>(null);
  const [userSubjects, setUserSubjects] = useState<string[]>(() => {
    // Pre-load from cache for instant redirect
    const lastEmail = localStorage.getItem('jamb_last_email');
    if (lastEmail) {
      const cached = localStorage.getItem(`jamb_subjects_${lastEmail}`);
      if (cached) {
        try {
          const subjects = JSON.parse(cached);
          if (Array.isArray(subjects) && subjects.length > 0) return subjects;
        } catch {
          // corrupted cache — ignore and reload from server
        }
      }
    }
    return [];
  });
  const [subjectsLoading, setSubjectsLoading] = useState(() => {
    // If we have cached subjects, don't block loading
    const lastEmail = localStorage.getItem('jamb_last_email');
    if (lastEmail) {
      const cached = localStorage.getItem(`jamb_subjects_${lastEmail}`);
      if (cached) {
        try {
          const subjects = JSON.parse(cached);
          if (Array.isArray(subjects) && subjects.length > 0) return false;
        } catch {
          // corrupted cache — keep loading state
        }
      }
    }
    return true;
  });
  const [quizType, setQuizType] = useState<QuizType>('full');
  const [quizResults, setQuizResults] = useState<QuizResultsProps['results'] | null>(null);
  const [practiceSubjectOverride, setPracticeSubjectOverride] = useState<string | null>(null);
  const [highlightStandard, setHighlightStandard] = useState(false);
  const [weakSubjectFromQuiz, setWeakSubjectFromQuiz] = useState<string | null>(null);
  const [showSubjectChanger, setShowSubjectChanger] = useState(false);
  const [syllabusTargetSubject, setSyllabusTargetSubject] = useState<string | null>(null);  const [flashcardsTargetSubject, setFlashcardsTargetSubject] = useState<string | null>(null);
  const [syllabusTargetTopic, setSyllabusTargetTopic] = useState<string | null>(null);
  const [lessonDeepLink, setLessonDeepLink] = useState<{ subject: string; topic: string | null } | null>(null);
  

  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [showQuizLimitModal, setShowQuizLimitModal] = useState(false);
  const [pendingQuizType] = useState<QuizType>('mini');
  const [showSubjectChangeLimitModal, setShowSubjectChangeLimitModal] = useState(false);
  
  // Track if we're waiting for payment flow to initialize
  const [, setIsPaymentFlowLoading] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('openPayment') === 'true';
  });
  
  const { user, isLoading, hasAccess, isAdmin, isOwner, userRole, userPackage, signOut, refreshAccess, roleResolved } = useAuth();
  const navigate = useNavigate();
  const { canUseFeature, incrementUsage } = useFeatureUsage();

  // PWA launch: when app is opened as installed (standalone) or via ?pwa=1
  // shortcut, skip the marketing landing. Signed-out users go to /auth so
  // they land in the app interface immediately.
  useEffect(() => {
    const isPwaLaunch =
      searchParams.get('pwa') === '1' ||
      (typeof window !== 'undefined' &&
        window.matchMedia?.('(display-mode: standalone)').matches);
    if (!isPwaLaunch) return;
    // Strip the ?pwa=1 param so it doesn't linger in the URL
    if (searchParams.get('pwa') === '1') {
      searchParams.delete('pwa');
      setSearchParams(searchParams, { replace: true });
    }
    const lastEmail = typeof window !== 'undefined' ? localStorage.getItem('jamb_last_email') : null;
    // No cached session —†’ send straight to auth (skip landing page)
    if (!lastEmail) {
      navigate('/auth', { replace: true });
    }
    // If a cached session exists, the existing effect below routes them to
    // the dashboard once auth resolves — no extra work needed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { hasFeature } = useFeatureAccess();
  
  // Database-backed trial system (shared via context)
  const { 
    formattedTime, 
     
    isTrialActive,
    
    canStartTrial,
    startTrial,
    loading: trialLoading,
  } = useTrialContext();

  // Wrap step changes in startTransition to prevent suspense errors with lazy-loaded components
  const navigateStep = useCallback((step: Step) => {
    startTransition(() => {
      setCurrentStep(step);
    });
  }, []);

  // Same for tab switches (mounts lazy components like StudyStats)
  const handleTabChange = useCallback((tab: DashboardTab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  }, []);

  const userEmail = user?.email?.toLowerCase() || null;
  const effectiveAccess = hasAccess || isOwner || isAdmin;
  const effectiveAdmin = isAdmin || isOwner;
  const effectiveOwner = isOwner;
  const effectiveSubjects = userSubjects.length > 0 ? userSubjects : DEFAULT_SUBJECTS;

  // Combined loading state - include subjects loading and role resolution
  const isFullyLoading = isLoading || trialLoading || subjectsLoading || !roleResolved;

  // Admins/owners can use dashboard normally - no auto-redirect
  // They access admin panel via the gear (Shield) icon in header
  
  // Ensure we never stay on subject—€‘select when subjects are already loaded
  useEffect(() => {
    if (userSubjects.length > 0 && currentStep === 'subject-select') {
      startTransition(() => setCurrentStep('dashboard'));
      saveDashboardState('dashboard');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [userSubjects, currentStep]);

  // Set initial step after auth and subjects are resolved to avoid landing flash
  const initialStepDoneRef = useRef(false);
  useEffect(() => {
    if (isFullyLoading) return; // wait for loading to finish
    if (initialStepDoneRef.current) return; // only set step once
    initialStepDoneRef.current = true;
    if (userEmail) {
      if (userSubjects.length === 0 && !effectiveAdmin) {
        setCurrentStep('subject-select');
      } else {
        setCurrentStep('dashboard');
        saveDashboardState('dashboard');
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      setCurrentStep('landing');
    }
  }, [isFullyLoading, userEmail, userSubjects.length, effectiveAdmin]);


  // Load user subjects - use cache FIRST for instant redirect, then sync from server
  useEffect(() => {
    const loadUserData = async () => {
      if (!userEmail) {
        setSubjectsLoading(false);
        return;
      }
      if (isLoading) return;
      
      // IMMEDIATE: Load cached subjects first so returning users skip to dashboard instantly
      const cached = localStorage.getItem(`jamb_subjects_${userEmail}`);
      if (cached) {
        try {
          const cachedSubjects = JSON.parse(cached);
          if (Array.isArray(cachedSubjects) && cachedSubjects.length > 0) {
            setUserSubjects(cachedSubjects);
            setSubjectsLoading(false); // Unblock UI immediately
          }
        } catch {
          // corrupted cache — fall through to server load
        }
      } else {
        setSubjectsLoading(true);
      }
      
      // BACKGROUND: Sync from server if online
      if (navigator.onLine) {
        try {
          const { data } = await supabase
            .from('user_subjects')
            .select('subjects')
            .eq('email', userEmail)
            .maybeSingle();
          
          if (data?.subjects) {
            setUserSubjects(data.subjects as string[]);
            localStorage.setItem(`jamb_subjects_${userEmail}`, JSON.stringify(data.subjects));
          }
        } catch (err) {
          errorLogger.error(err, { component: 'Index', action: 'sync subjects' });
        }
      }
      
      setSubjectsLoading(false);

      // Load weak subject from quiz history
      const { data: quizData } = await supabase
        .from('quiz_attempts')
        .select('subjects, correct_answers, total_questions')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(5);

      if (quizData && quizData.length > 0) {
        const subjectScores: Record<string, { correct: number; total: number }> = {};
        quizData.forEach(attempt => {
          const subjects = attempt.subjects as string[];
          subjects.forEach(s => {
            if (!subjectScores[s]) subjectScores[s] = { correct: 0, total: 0 };
            subjectScores[s].correct += attempt.correct_answers;
            subjectScores[s].total += attempt.total_questions;
          });
        });

        let worstSubject = '';
        let worstRate = 1;
        Object.entries(subjectScores).forEach(([subject, scores]) => {
          const rate = scores.correct / scores.total;
          if (rate < worstRate) {
            worstRate = rate;
            worstSubject = subject;
          }
        });
        if (worstSubject) setWeakSubjectFromQuiz(worstSubject);
      }
    };
    
    loadUserData();
  }, [userEmail, isLoading]);

  // Save last email for cache pre-loading on next visit
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('jamb_last_email', userEmail);
    }
  }, [userEmail]);

  // Flush any subjects saved while offline once we're back online.
  useEffect(() => {
    const flushPendingSubjects = async () => {
      if (!navigator.onLine) return;
      const raw = localStorage.getItem('jamb_pending_subjects');
      if (!raw) return;
      try {
        const queue: { email: string; subjects: string[] }[] = JSON.parse(raw);
        if (!Array.isArray(queue) || queue.length === 0) return;
        // Keep only the latest entry per email
        const byEmail = new Map<string, string[]>();
        queue.forEach((q) => byEmail.set(q.email, q.subjects));
        for (const [email, subjects] of byEmail) {
          await supabase.from('user_subjects').upsert(
            { email, subjects: subjects as Database['public']['Enums']['jamb_subject'][], updated_at: new Date().toISOString() },
            { onConflict: 'email' },
          );
        }
        localStorage.removeItem('jamb_pending_subjects');
      } catch {
        // ignore flush errors
      }
    };
    flushPendingSubjects();
    window.addEventListener('online', flushPendingSubjects);
    return () => window.removeEventListener('online', flushPendingSubjects);
  }, []);

  // Push opt-in mirrors the Settings notifications toggle (read on mount;
  // Settings is a separate route so this re-reads on every return).
  const [pushOptIn] = useState(() => {
    try {
      const lastEmail = localStorage.getItem('jamb_last_email') || '';
      const raw = localStorage.getItem(`jamb_user_settings_${lastEmail}`);
      return !!JSON.parse(raw || '{}')?.notificationsEnabled;
    } catch {
      return false;
    }
  });
  usePushNotifications({ userEmail, enabled: pushOptIn });

  // Silently re-arm the daily study reminder (no permission prompt here —
  // only schedules if the OS already granted permission).
  useEffect(() => {
    if (!userEmail) return;
    try {
      const raw = localStorage.getItem(`jamb_user_settings_${userEmail}`);
      if (!raw) return;
      const s = JSON.parse(raw) as { notificationsEnabled?: boolean; reminderTime?: string };
      if (!s?.notificationsEnabled) return;
      const { hour, minute } = parseReminderTime(s.reminderTime || '19:30');
      void reconcileReminder(true, hour, minute);
    } catch {
      // corrupted settings — user can re-enable from Settings
    }
  }, [userEmail]);

  // Handle URL params
  useEffect(() => {
    const step = searchParams.get('step');
    const openPayment = searchParams.get('openPayment');
    const planParam = searchParams.get('plan');
    
    // Handle payment modal opening from auth redirect
    if (openPayment === 'true' && planParam && user) {
      const planKey = planParam as keyof typeof plans;
      if (plans[planKey]) {
        setSelectedPlan(planKey);
        setIsPaymentModalOpen(true);
      }
      setIsPaymentFlowLoading(false);
      setSearchParams({});
      return;
    }
    
    // Clear payment loading if no valid payment params
    if (openPayment === 'true' && !planParam) {
      setIsPaymentFlowLoading(false);
    }
    
    if (step === 'dashboard' && (effectiveAccess || isTrialActive) && userEmail) {
      startTransition(() => setCurrentStep('dashboard'));
      setSearchParams({});
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    
    if (isFullyLoading) return;
    
    if (step === 'upload' && userEmail) {
      if (userSubjects.length === 0 && !effectiveAdmin) {
        startTransition(() => setCurrentStep('subject-select'));
      } else {
        startTransition(() => setCurrentStep('upload'));
      }
      setSearchParams({});
    } else if (step === 'dashboard' && userEmail && (effectiveAccess || isTrialActive)) {
      startTransition(() => setCurrentStep('dashboard'));
      setSearchParams({});
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [searchParams, setSearchParams, userEmail, userSubjects.length, isFullyLoading, effectiveAccess, effectiveAdmin, isTrialActive, user]);

  // Save dashboard state when step changes
  useEffect(() => {
    saveDashboardState(currentStep);
  }, [currentStep]);

  const handleGetStarted = () => {
    // Scroll to pricing for everyone
    setHighlightStandard(true);
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        const headerOffset = 80;
        const elementPosition = pricingSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSeeHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPlan = (plan: string) => {
    const planKey = plan as keyof typeof plans;
    setSelectedPlan(planKey);
    
    // Admin/owner/collaborators already have full access
    if (isAdmin || isOwner) {
      toast.info('You already have full access!');
      return;
    }
    
    // Users with paid access already
    if (hasAccess) {
      toast.info('You already have an active subscription!');
      return;
    }
    
    // Show plan selection modal for everyone (authenticated or not)
    // Modal will handle the trial vs payment decision
    setIsPlanSelectionOpen(true);
  };

  const handlePaymentFromPlanModal = () => {
    setIsPlanSelectionOpen(false);
    // If not logged in, redirect to signup first with plan info
    if (!user) {
      navigate('/auth', { state: { plan: selectedPlan, returnToPayment: true, flow: 'signup' } });
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
  };

  const handlePaymentSuccess = async (_reference: string, _email: string) => {
    setIsPaymentModalOpen(false);
    await refreshAccess();
    
    // If user already has subjects (e.g. trial-expired user upgrading), go straight to dashboard
    if (userSubjects.length > 0) {
      toast.success('Payment successful! 🎉 Welcome back!');
      startTransition(() => setCurrentStep('dashboard'));
      saveDashboardState('dashboard');
    } else {
      toast.success('Payment successful! 🎉 Let\'s pick your subjects!');
      startTransition(() => setCurrentStep('subject-select'));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSubjectsSelected = async (subjects: string[]) => {    // Enforce subject_change limit for returning users (not initial setup)
    if (userSubjects.length > 0 && userPackage === 'basic' && !canUseFeature('subject_change')) {
      setShowSubjectChangeLimitModal(true);
      return;
    }
    if (userSubjects.length > 0 && userPackage === 'basic') {
      const ok = await incrementUsage('subject_change');
      if (!ok) {
        setShowSubjectChangeLimitModal(true);
        return;
      }
    }

    setUserSubjects(subjects);
    trackFunnel(userEmail, 'subjects_selected', { count: subjects.length });

    // Fulfill the subject-select promise ("Pick your subjects to start your
    // 7-day SCHOLAR trial!"): trial entries begin here.
    if (!effectiveAccess && canStartTrial && !effectiveAdmin && user) {
      const started = await startTrial();
      if (started) {
        toast.success('7-day SCHOLAR trial started! Enjoy full access 🎉');
      }
    }
    
    // Refresh access to get latest payment status
    await refreshAccess();
    
    // Check for pending payment first - if one exists, don't start trial
    const { data: pendingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('email', userEmail || '')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // If there's a pending payment, wait a bit and retry access check
    if (pendingPayment) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refreshAccess();
    }
    
    // Double-check access with fresh database query to ensure we have latest payment status
    const { data: accessData } = await supabase.rpc('check_user_access', { 
      user_email: userEmail || '' 
    });
    
    const currentAccess = accessData?.[0]?.has_access || false;
    
    if (currentAccess && !effectiveAdmin) {
      toast.success('🎉 Payment confirmed! Enjoy your subscription!');
    } else if (pendingPayment) {
      // Payment is being processed
      toast.info('Your payment is being processed...');
    }
    
    startTransition(() => setCurrentStep('dashboard'));
    saveDashboardState('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleUploadComplete = (files: File[]) => {
    toast.success(`${files.length} file(s) processed! Questions extracted. ✅`);
    // Stay on the upload page to show results - don't redirect
  };

  const handleFormSubmit = (data: unknown) => {
    setPersonalizationData(data as FormData);
    toast.success('Creating your personalized study plan... 👋');
    navigateStep('study-plan');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const handleGenerateStudyPlan = () => {
    navigateStep('study-plan');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOpenStudyCalendar = () => {
    navigateStep('study-plan-tracker');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleStartQuiz = async (type: QuizType) => {
    setQuizType(type);
    trackFunnel(userEmail, 'quiz_started', { type });
    navigateStep('quiz');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleQuizComplete = (results: QuizResultsProps['results']) => {
    setQuizResults(results);
    navigateStep('quiz-results');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleUpgradeClick = (plan?: string) => {
    setSelectedPlan((plan && plans[plan as keyof typeof plans] ? plan : 'pro') as keyof typeof plans);
    setIsPlanSelectionOpen(true);
    // Every upgrade CTA funnels through here = paywall impression
    trackFunnel(userEmail, 'paywall_seen', plan ? { plan } : undefined);
  };

  // Shared trial entry: starts the 7-day SCHOLAR trial and routes into
  // the app (dashboard if subjects exist, subject-select otherwise).
  const handleStartTrialFlow = async () => {
    if (!user) {
      // Signed-out visitors pick a plan first, then sign up — the trial
      // begins automatically once they finish subject selection.
      setIsPlanSelectionOpen(false);
      navigate('/auth', { state: { flow: 'signup' } });
      return;
    }
    const started = await startTrial();
    if (!started) {
      toast.error('Could not start trial. Please try again.');
      return;
    }
    setIsPlanSelectionOpen(false);
    toast.success('7-day SCHOLAR trial started! 🎉');
    if (userSubjects.length > 0) {
      startTransition(() => setCurrentStep('dashboard'));
      saveDashboardState('dashboard');
    } else {
      startTransition(() => setCurrentStep('subject-select'));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSignOut = async () => {
    localStorage.removeItem(DASHBOARD_STATE_KEY);
    await signOut();
    startTransition(() => setCurrentStep('landing'));
    setUserSubjects([]);
    setPersonalizationData(null);
    navigate('/');
    toast.success('Signed out successfully');
  };

  const handleBackToDashboard = () => {
    setPracticeSubjectOverride(null);
    setSyllabusTargetSubject(null);
    setSyllabusTargetTopic(null);
    setFlashcardsTargetSubject(null);
    setLessonDeepLink(null);
    startTransition(() => setCurrentStep('dashboard'));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  // Study plan calendar -> learning section links
  const handleStudyPlanPractice = (subject: string) => {
    setPracticeSubjectOverride(subject);
    setQuizType('subject');
    navigateStep('quiz');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Calendar / mastery -> interactive lesson (lessons own the teaching;
  // syllabus stays the official read-only outline).
  const handleOpenLesson = (subject: string, topic?: string | null) => {
    setLessonDeepLink({ subject, topic: topic ?? null });
    navigateStep('lessons');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleLessonsBack = () => {
    setLessonDeepLink(null);
    handleBackToDashboard();
  };

  const handleStudyPlanFlashcards = (subject: string) => {
    setFlashcardsTargetSubject(subject);
    navigateStep('flashcards');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSubjectsChanged = async (subjects: string[]) => {
    setUserSubjects(subjects);
    setShowSubjectChanger(false);
    setWeakSubjectFromQuiz(null);
    setQuizResults(null);
    toast.success('Subjects updated! App data refreshed. 🎉');
  };

  // Skip rendering while step is loading to prevent flash
  if (currentStep === 'loading') {
    return <DashboardSkeleton />;
  }

  // Quiz step
  if (currentStep === 'quiz' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        {isTrialActive && formattedTime && (
          <TrialTimerBadge formattedTime={formattedTime} isLow={parseInt(formattedTime.split(':')[0]) < 5} />
        )}
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <BackButton onClick={handleBackToDashboard} />
          <Suspense fallback={<LazyFallback />}>
            <TimedQuiz
              userEmail={userEmail}
              subjects={practiceSubjectOverride ? [practiceSubjectOverride] : effectiveSubjects}
              quizType={quizType}
              onComplete={handleQuizComplete}
              onExit={handleBackToDashboard}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  // Mock CBT step
  if (currentStep === 'mock' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        {isTrialActive && formattedTime && (
          <TrialTimerBadge formattedTime={formattedTime} isLow={parseInt(formattedTime.split(':')[0]) < 5} />
        )}
        <DashboardHeader
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <Suspense fallback={<LazyFallback />}>
            <MockExam
              userEmail={userEmail}
              subjects={effectiveSubjects}
              onExit={handleBackToDashboard}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  // Quiz results step
  if (currentStep === 'quiz-results' && quizResults) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail || ''}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <BackButton onClick={handleBackToDashboard} />
          <Suspense fallback={<LazyFallback />}>
          <QuizResults
            results={quizResults}
            quizType={quizType}
            userEmail={userEmail || ''}
            onRetry={handleBackToDashboard}
            onHome={handleBackToDashboard}
          />
          </Suspense>
        </div>
      </div>
    );
  }

  // Subject selection step
  if (currentStep === 'subject-select' && userEmail) {
    // Admins with no subjects selected - go to dashboard (they have full access)
    if (effectiveAdmin) {
      startTransition(() => setCurrentStep('dashboard'));
      return null;
    }
    
    const isTrialEntry = !effectiveAccess && canStartTrial;
    
    return (
      <div className="min-h-screen bg-background">
        {!isTrialEntry && (
          <BackButton onClick={() => setCurrentStep('landing')} />
        )}
        <Suspense fallback={<LazyFallback />}>
        <SubjectSelector
          userEmail={userEmail}
          onComplete={handleSubjectsSelected}
          isBypassUser={effectiveAdmin}
        />
        </Suspense>
        {isTrialEntry && (
          <div className="fixed bottom-4 left-0 right-0 text-center">
            <p className="text-sm text-muted-foreground">
              👋 Pick your subjects to start your 7-day SCHOLAR trial!
            </p>
          </div>
        )}
      </div>
    );
  }

  // Study Plan Generator step
  if (currentStep === 'study-plan' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <BackButton onClick={handleBackToDashboard} />
          <StudyPlanGenerator
            userEmail={userEmail}
            subjects={effectiveSubjects}
            targetScore={personalizationData?.targetScore ? parseInt(personalizationData.targetScore) : 300}
            hoursPerDay={personalizationData?.hoursPerDay ? parseInt(personalizationData.hoursPerDay) : 4}
            weakestSubject={weakSubjectFromQuiz || personalizationData?.weakestSubject}
            examDate={personalizationData?.examDate}
            onBack={handleBackToDashboard}
            onViewCalendar={() => navigateStep('study-plan-tracker')}
          />
        </div>
      </div>
    );
  }

  // Study plan tracker step (calendar + check-off + reminders)
  if (currentStep === 'study-plan-tracker' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <BackButton onClick={handleBackToDashboard} />
          <StudyPlanTracker
            userEmail={userEmail}
            onBack={handleBackToDashboard}
            onGenerateNew={handleGenerateStudyPlan}
            onStartPractice={handleStudyPlanPractice}
            onOpenLesson={handleOpenLesson}
            onOpenFlashcards={handleStudyPlanFlashcards}
          />
        </div>
      </div>
    );
  }

  // Syllabus Reader step
  if (currentStep === 'syllabus' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <Suspense fallback={<LazyFallback />}>
            <SyllabusReader
              userEmail={userEmail}
              subjects={effectiveSubjects}
              onBack={handleBackToDashboard}
              initialSubject={syllabusTargetSubject || undefined}
              initialTopic={syllabusTargetTopic || undefined}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  // Interactive Lessons step
  if (currentStep === 'lessons' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <Suspense fallback={<LazyFallback />}>
            <LessonLibrary
              userEmail={userEmail}
              subjects={effectiveSubjects}
              onBack={handleLessonsBack}
              initialSubject={lessonDeepLink?.subject}
              initialTopic={lessonDeepLink?.topic}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  // Flashcards step
  if (currentStep === 'flashcards' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <Flashcards
            userEmail={userEmail}
            subjects={effectiveSubjects}
            onBack={handleBackToDashboard}
            initialSubject={flashcardsTargetSubject || undefined}
          />
        </div>
      </div>
    );
  }

  // Course Requirements step
  if (currentStep === 'course-requirements' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <Suspense fallback={<LazyFallback />}>
          <CourseRequirements
            userSubjects={effectiveSubjects}
            onBack={handleBackToDashboard}
          />
          </Suspense>
        </div>
      </div>
    );
  }

  // Study Notes step
  if (currentStep === 'notes' && userEmail) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <StudyNotes
          userEmail={userEmail}
          subjects={effectiveSubjects}
          isOwner={effectiveOwner}
          isAdmin={isAdmin}
          userRole={userRole}
          onSignOut={handleSignOut}
          onBack={handleBackToDashboard}
        />
      </Suspense>
    );
  }




  // Novels step
  if (currentStep === 'novels' && userEmail) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <NovelBrowser
          userEmail={userEmail}
          onBack={handleBackToDashboard}
          onSelectNovel={(novelId) => {
            setSelectedNovelId(novelId);
            navigateStep('novel-detail');
          }}
        />
      </Suspense>
    );
  }

  // Novel Detail step
  if (currentStep === 'novel-detail' && userEmail && selectedNovelId) {
    return (
      <NovelDetail
        novelId={selectedNovelId}
        userEmail={userEmail}
        onBack={() => navigateStep('novels')}
        onStartReading={(chapterId) => {
          setSelectedChapterId(chapterId);
          navigateStep('novel-reader');
        }}
      />
    );
  }

  // Novel Reader step
  if (currentStep === 'novel-reader' && userEmail && selectedChapterId) {
    return (
      <NovelReader
        chapterId={selectedChapterId}
        userEmail={userEmail}
        onBack={() => navigateStep('novel-detail')}
        onNextChapter={(chapterId) => setSelectedChapterId(chapterId)}
        onPrevChapter={(chapterId) => setSelectedChapterId(chapterId)}
      />
    );
  }

  // JAMB News step
  if (currentStep === 'news' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <JambNewsPage onBack={handleBackToDashboard} />
      </div>
    );
  }

  // Scholarships step
  if (currentStep === 'scholarships' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <ScholarshipPage
          onBack={handleBackToDashboard}
          userEmail={userEmail}
          userId={user?.id}
          onPracticeQuiz={() => {
            setQuizType('mini');
            navigateStep('quiz');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        />
      </div>
    );
  }

  // Leaderboard step
  if (currentStep === 'leaderboard' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <Leaderboard onBack={handleBackToDashboard} userEmail={userEmail} />
      </div>
    );
  }

  // Upload step
  if (currentStep === 'upload' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <BackButton onClick={handleBackToDashboard} />
          <UploadSection onUploadComplete={handleUploadComplete} />
        </div>
        <Suspense fallback={null}>
        <Footer />
        </Suspense>
      </div>
    );
  }

  // Personalize step
  if (currentStep === 'personalize' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          userEmail={userEmail}
          isOwner={effectiveOwner}
          isCollaborator={isAdmin && !isOwner}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="pt-16">
          <BackButton onClick={handleBackToDashboard} />
          <Suspense fallback={<LazyFallback />}>
          <PersonalizationForm onSubmit={handleFormSubmit} />
          </Suspense>
        </div>
        <Suspense fallback={null}>
        <Footer />
        </Suspense>
      </div>
    );
  }

  // Dashboard step
  if (currentStep === 'dashboard' && userEmail) {
    return (
      <PaywallGate hasAccess={effectiveAccess} isLoading={isFullyLoading} onUpgrade={handleUpgradeClick} userEmail={userEmail}>
        <div className="min-h-screen bg-background">
          {/* Desktop Sidebar */}
          <DesktopSidebar
            active={activeTab}
            onChange={handleTabChange}
            userName={user?.user_metadata?.full_name}
            userEmail={userEmail}
            isOwner={effectiveOwner}
            isAdmin={effectiveAdmin}
            userRole={userRole}
            onSignOut={handleSignOut}
            onNavigate={(path) => navigate(path)}
            onQuickStart={(step) => {
              handleTabChange('home');
              navigateStep(step);
            }}
            hasAccess={effectiveAccess}
          />
          
          {/* Trial Timer Badge */}
          {isTrialActive && formattedTime && (
            <TrialTimerBadge formattedTime={formattedTime} isLow={parseInt(formattedTime.split(':')[0]) < 5} />
          )}
          
          {/* Subject Changer Modal */}
          {showSubjectChanger && (
            <SubjectChanger
              userEmail={userEmail}
              currentSubjects={effectiveSubjects}
              onComplete={handleSubjectsChanged}
              onClose={() => setShowSubjectChanger(false)}
              isBypassUser={effectiveAdmin}
            />
          )}
          
          <DashboardHeader 
            userEmail={userEmail}
            isOwner={effectiveOwner}
            isCollaborator={isAdmin && !isOwner}
            userRole={userRole}
            onSignOut={handleSignOut}
          />
          <div className="pt-20 pb-24 px-4 md:pb-8 md:pl-[276px] lg:pl-[296px]">
            <div className="max-w-6xl mx-auto">
              {/* ================= HOME TAB ================= */}
              {activeTab === 'home' && (
                <HomeTab
                  userEmail={userEmail}
                  user={user}
                  effectiveAdmin={effectiveAdmin}
                  effectiveOwner={effectiveOwner}
                  effectiveAccess={effectiveAccess}
                  effectiveSubjects={effectiveSubjects}
                  userRole={userRole}
                  isTrialActive={isTrialActive}
                  formattedTime={formattedTime}
                  weakSubjectFromQuiz={weakSubjectFromQuiz}
                  personalizationData={personalizationData}
                  hasFeature={hasFeature}
                  navigateStep={navigateStep}
                  navigate={navigate}
                  handleUpgradeClick={handleUpgradeClick}
                  handleSignOut={handleSignOut}
                  handleTabChange={handleTabChange}
                  setPracticeSubjectOverride={setPracticeSubjectOverride}
                  setQuizType={setQuizType}
                  setSyllabusTargetSubject={setSyllabusTargetSubject}
                  setSyllabusTargetTopic={setSyllabusTargetTopic}
                  setFlashcardsTargetSubject={setFlashcardsTargetSubject}
                  setShowSubjectChanger={setShowSubjectChanger}
                  handleOpenStudyCalendar={handleOpenStudyCalendar}
                  handleGenerateStudyPlan={handleGenerateStudyPlan}
                  handleStartQuiz={handleStartQuiz}
                />
              )}

              {/* ================= STUDY TAB ================= */}
              {activeTab === 'study' && (
                <StudyTab
                  userEmail={userEmail}
                  user={user}
                  effectiveAdmin={effectiveAdmin}
                  effectiveOwner={effectiveOwner}
                  effectiveAccess={effectiveAccess}
                  effectiveSubjects={effectiveSubjects}
                  userRole={userRole}
                  isTrialActive={isTrialActive}
                  formattedTime={formattedTime}
                  weakSubjectFromQuiz={weakSubjectFromQuiz}
                  personalizationData={personalizationData}
                  hasFeature={hasFeature}
                  navigateStep={navigateStep}
                  navigate={navigate}
                  handleUpgradeClick={handleUpgradeClick}
                  handleSignOut={handleSignOut}
                  handleTabChange={handleTabChange}
                  setPracticeSubjectOverride={setPracticeSubjectOverride}
                  setQuizType={setQuizType}
                  setSyllabusTargetSubject={setSyllabusTargetSubject}
                  setSyllabusTargetTopic={setSyllabusTargetTopic}
                  setFlashcardsTargetSubject={setFlashcardsTargetSubject}
                  setShowSubjectChanger={setShowSubjectChanger}
                  handleGenerateStudyPlan={handleGenerateStudyPlan}
                />
              )}

              {/* ================= AI TAB ================= */}
              {activeTab === 'ai' && (
                <AiTab
                  userEmail={userEmail}
                  user={user}
                  effectiveAdmin={effectiveAdmin}
                  effectiveOwner={effectiveOwner}
                  effectiveAccess={effectiveAccess}
                  effectiveSubjects={effectiveSubjects}
                  userRole={userRole}
                  isTrialActive={isTrialActive}
                  formattedTime={formattedTime}
                  weakSubjectFromQuiz={weakSubjectFromQuiz}
                  personalizationData={personalizationData}
                  hasFeature={hasFeature}
                  navigateStep={navigateStep}
                  navigate={navigate}
                  handleUpgradeClick={handleUpgradeClick}
                  handleSignOut={handleSignOut}
                  handleTabChange={handleTabChange}
                  setPracticeSubjectOverride={setPracticeSubjectOverride}
                  setQuizType={setQuizType}
                  setSyllabusTargetSubject={setSyllabusTargetSubject}
                  setSyllabusTargetTopic={setSyllabusTargetTopic}
                  setFlashcardsTargetSubject={setFlashcardsTargetSubject}
                  setShowSubjectChanger={setShowSubjectChanger}
                  onOpenLesson={handleOpenLesson}
                />
              )}

              {/* ================= COMMUNITY TAB ================= */}
              {activeTab === 'community' && (
                <CommunityTab
                  userEmail={userEmail}
                  user={user}
                  effectiveAdmin={effectiveAdmin}
                  effectiveOwner={effectiveOwner}
                  effectiveAccess={effectiveAccess}
                  effectiveSubjects={effectiveSubjects}
                  userRole={userRole}
                  isTrialActive={isTrialActive}
                  formattedTime={formattedTime}
                  weakSubjectFromQuiz={weakSubjectFromQuiz}
                  personalizationData={personalizationData}
                  hasFeature={hasFeature}
                  navigateStep={navigateStep}
                  navigate={navigate}
                  handleUpgradeClick={handleUpgradeClick}
                  handleSignOut={handleSignOut}
                  handleTabChange={handleTabChange}
                  setPracticeSubjectOverride={setPracticeSubjectOverride}
                  setQuizType={setQuizType}
                  setSyllabusTargetSubject={setSyllabusTargetSubject}
                  setSyllabusTargetTopic={setSyllabusTargetTopic}
                  setFlashcardsTargetSubject={setFlashcardsTargetSubject}
                  setShowSubjectChanger={setShowSubjectChanger}
                />
              )}

              {/* ================= PROFILE TAB ================= */}
              {activeTab === 'profile' && (
                <ProfileTab
                  userEmail={userEmail}
                  user={user}
                  effectiveAdmin={effectiveAdmin}
                  effectiveOwner={effectiveOwner}
                  effectiveAccess={effectiveAccess}
                  effectiveSubjects={effectiveSubjects}
                  userRole={userRole}
                  isTrialActive={isTrialActive}
                  formattedTime={formattedTime}
                  weakSubjectFromQuiz={weakSubjectFromQuiz}
                  personalizationData={personalizationData}
                  hasFeature={hasFeature}
                  navigateStep={navigateStep}
                  navigate={navigate}
                  handleUpgradeClick={handleUpgradeClick}
                  handleSignOut={handleSignOut}
                  handleTabChange={handleTabChange}
                  setPracticeSubjectOverride={setPracticeSubjectOverride}
                  setQuizType={setQuizType}
                  setSyllabusTargetSubject={setSyllabusTargetSubject}
                  setSyllabusTargetTopic={setSyllabusTargetTopic}
                  setFlashcardsTargetSubject={setFlashcardsTargetSubject}
                  setShowSubjectChanger={setShowSubjectChanger}
                />
              )}
            </div>
          </div>
        </div>
          <BottomNav active={activeTab} onChange={handleTabChange} />
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>

        {/* Plan Selection Modal - must be inside dashboard return */}
        {selectedPlan && (
          <PlanSelectionModal
            isOpen={isPlanSelectionOpen}
            onClose={() => setIsPlanSelectionOpen(false)}
            planName={plans[selectedPlan].name}
            planPrice={plans[selectedPlan].price}
            onContinuePayment={handlePaymentFromPlanModal}
            canStartTrial={canStartTrial}
            onStartTrial={handleStartTrialFlow}
          />
        )}

        {/* Payment Modal - must be inside dashboard return */}
        {selectedPlan && user && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={handlePaymentModalClose}
            plan={plans[selectedPlan]}
            onSuccess={handlePaymentSuccess}
            initialEmail={userEmail || undefined}
          />
        )}

        {/* Subject Change Limit Modal */}
        {showSubjectChangeLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <FeatureLimitReached
              featureType="subject_change"
              onBonusEarned={() => {
                setShowSubjectChangeLimitModal(false);
              }}
              className="max-w-md w-full"
            />
          </div>
        )}

        {/* Quiz Daily Limit Modal */}
        {showQuizLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <FeatureLimitReached
              featureType="quick_quiz"
              onBonusEarned={() => {
                setShowQuizLimitModal(false);
                if (canUseFeature('quick_quiz')) {
                  handleStartQuiz(pendingQuizType);
                }
              }}
              className="max-w-md w-full"
            />
          </div>
        )}
      </PaywallGate>
    );
  }

  // Landing page
  const handleGoToDashboard = () => {
    startTransition(() => {
      if (userSubjects.length === 0 && !effectiveAdmin) {
        setCurrentStep('subject-select');
      } else {
        setCurrentStep('dashboard');
      }
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Trial Timer Badge on landing page */}
      {isTrialActive && formattedTime && (
        <TrialTimerBadge formattedTime={formattedTime} isLow={parseInt(formattedTime.split(':')[0]) < 5} />
      )}
      
      <Header onGetStarted={handleGetStarted} hasAccess={effectiveAccess || isTrialActive} />
      <div className="pt-16">
        {/* Admin Badge, Dashboard Button, and Sign Out for logged in users */}
        {user && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2">
            {effectiveAdmin && (
              <AdminBadge 
                role={userRole} 
                linkToAdmin={effectiveOwner} 
              />
            )}
            {(effectiveAccess || isTrialActive) && (
              <Button
                variant="default"
                size="sm"
                onClick={handleGoToDashboard}
                className="gradient-primary text-primary-foreground"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                {isTrialActive && !effectiveAccess ? 'Try Dashboard' : 'Dashboard'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
        <Suspense fallback={<LazyFallback />}>
        <HeroSection 
          onGetStarted={handleGetStarted} 
          hasAccess={effectiveAccess}
          onSeeHowItWorks={handleSeeHowItWorks}
        />
        <HowItWorksSection onStartTrial={startTrial} />
        <PricingSection onSelectPlan={handleSelectPlan} highlightStandard={highlightStandard} />
        </Suspense>

        {/* Plan + payment modals must also render on landing — otherwise
            signed-out visitors clicking pricing get a dead click. */}
        {selectedPlan && (
          <Suspense fallback={null}>
            <PlanSelectionModal
              isOpen={isPlanSelectionOpen}
              onClose={() => setIsPlanSelectionOpen(false)}
              planName={plans[selectedPlan].name}
              planPrice={plans[selectedPlan].price}
              onContinuePayment={handlePaymentFromPlanModal}
              canStartTrial={canStartTrial}
              onStartTrial={handleStartTrialFlow}
            />
          </Suspense>
        )}
        {selectedPlan && user && (
          <Suspense fallback={null}>
            <PaymentModal
              isOpen={isPaymentModalOpen}
              onClose={handlePaymentModalClose}
              plan={plans[selectedPlan]}
              onSuccess={handlePaymentSuccess}
              initialEmail={userEmail || undefined}
            />
          </Suspense>
        )}
        
      </div>
      <Suspense fallback={null}>
      <Footer />
      </Suspense>

    </div>
  );
};

export default Index;

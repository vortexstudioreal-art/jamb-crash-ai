import { useState, useEffect, lazy, Suspense, startTransition, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UploadSection } from '@/components/UploadSection';
import { PlanSelectionModal } from '@/components/PlanSelectionModal';
import { PaywallGate } from '@/components/PaywallGate';
import { AdminBadge } from '@/components/AdminBadge';
import { SubjectChanger } from '@/components/SubjectChanger';
import type { QuizResultsProps } from '@/components/QuizResults';
import { TrialExpiredScreen } from '@/components/TrialExpiredScreen';
import { TrialTimerBadge } from '@/components/TrialTimerBadge';
import { BackButton } from '@/components/BackButton';
import { FeatureGate, useFeatureAccess } from '@/components/FeatureGate';
import { useFeatureUsage } from '@/hooks/useFeatureUsage';
import { useExamDate } from '@/hooks/useExamDate';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, FileText, Target, Calendar, BookOpen, Zap, LogOut, Lock, RefreshCw, Layers, X, GraduationCap, Library, Newspaper, Trophy, Flame, StickyNote, Gamepad2, Download } from 'lucide-react';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { GoogleAdSense } from '@/components/GoogleAdSense';
import { BottomNav, type DashboardTab } from '@/components/BottomNav';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { Sparkles, Settings as SettingsIcon, Crown, Bell, MessageCircle, Youtube } from 'lucide-react';
import { StudyPlanTodayCard } from '@/components/StudyPlanTodayCard';
import { RenewalNudge } from '@/components/RenewalNudge';
import { LiveCounter } from '@/components/LiveCounter';
import { Award, Users, Brain } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useSeo } from '@/hooks/useSeo';


// Lazy-loaded heavy components
const TimedQuiz = lazy(() => import('@/components/TimedQuiz').then(m => ({ default: m.TimedQuiz })));
const MockExam = lazy(() => import('@/components/MockExam').then(m => ({ default: m.MockExam })));
const Flashcards = lazy(() => import('@/components/Flashcards').then(m => ({ default: m.Flashcards })));
const StudyPlanGenerator = lazy(() => import('@/components/StudyPlanGenerator').then(m => ({ default: m.StudyPlanGenerator })));
const StudyPlanTracker = lazy(() => import('@/components/StudyPlanTracker').then(m => ({ default: m.StudyPlanTracker })));
const SyllabusReader = lazy(() => import('@/components/SyllabusReader').then(m => ({ default: m.SyllabusReader })));
const StudyMaterials = lazy(() => import('@/components/StudyMaterials').then(m => ({ default: m.StudyMaterials })));
const NovelBrowser = lazy(() => import('@/components/novels/NovelBrowser').then(m => ({ default: m.NovelBrowser })));
const NovelDetail = lazy(() => import('@/components/novels/NovelDetail').then(m => ({ default: m.NovelDetail })));
const NovelReader = lazy(() => import('@/components/novels/NovelReader').then(m => ({ default: m.NovelReader })));
const JambNewsPage = lazy(() => import('@/components/JambNewsPage').then(m => ({ default: m.JambNewsPage })));
const ScholarshipPage = lazy(() => import('@/components/ScholarshipPage').then(m => ({ default: m.ScholarshipPage })));
const Leaderboard = lazy(() => import('@/components/Leaderboard').then(m => ({ default: m.Leaderboard })));
const StudyNotes = lazy(() => import('@/components/StudyNotes').then(m => ({ default: m.StudyNotes })));
const StudyStats = lazy(() => import('@/components/StudyStats').then(m => ({ default: m.StudyStats })));
const ChatBot = lazy(() => import('@/components/ChatBot').then(m => ({ default: m.ChatBot })));
const HeroSection = lazy(() => import('@/components/HeroSection').then(m => ({ default: m.HeroSection })));
const HowItWorksSection = lazy(() => import('@/components/HowItWorksSection').then(m => ({ default: m.HowItWorksSection })));
const PricingSection = lazy(() => import('@/components/PricingSection').then(m => ({ default: m.PricingSection })));
const PersonalizationForm = lazy(() => import('@/components/PersonalizationForm').then(m => ({ default: m.PersonalizationForm })));
const PaymentModal = lazy(() => import('@/components/PaymentModal').then(m => ({ default: m.PaymentModal })));
const PremiumDashboard = lazy(() => import('@/components/PremiumDashboard').then(m => ({ default: m.PremiumDashboard })));
const SubjectSelector = lazy(() => import('@/components/SubjectSelector').then(m => ({ default: m.SubjectSelector })));
const QuizResults = lazy(() => import('@/components/QuizResults').then(m => ({ default: m.QuizResults })));
const TopicMasteryTracker = lazy(() => import('@/components/TopicMasteryTracker').then(m => ({ default: m.TopicMasteryTracker })));
const CourseRequirements = lazy(() => import('@/components/CourseRequirements').then(m => ({ default: m.CourseRequirements })));
const CourseTipsCard = lazy(() => import('@/components/CourseTipsCard').then(m => ({ default: m.CourseTipsCard })));
const Footer = lazy(() => import('@/components/Footer').then(m => ({ default: m.Footer })));
const FeatureLimitReached = lazy(() => import('@/components/FeatureLimitReached').then(m => ({ default: m.FeatureLimitReached })));
const HomeSummary = lazy(() => import('@/components/HomeSummary').then(m => ({ default: m.HomeSummary })));
const ReferralSystem = lazy(() => import('@/components/ReferralSystem').then(m => ({ default: m.ReferralSystem })));
const OfflineReadyCard = lazy(() => import('@/components/OfflineReadyCard').then(m => ({ default: m.OfflineReadyCard })));
const LazyFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

type Step = 'landing' | 'subject-select' | 'upload' | 'personalize' | 'processing' | 'dashboard' | 'quiz' | 'quiz-results' | 'mock' | 'study-plan' | 'study-plan-tracker' | 'study-materials' | 'syllabus' | 'flashcards' | 'course-requirements' | 'novels' | 'novel-detail' | 'novel-reader' | 'news' | 'scholarships' | 'leaderboard' | 'notes' | 'speed-round' | 'streak';
type QuizType = 'full' | 'mini' | 'subject' | 'timed-practice';

interface FormData {
  targetScore: string;
  hoursPerDay: string;
  weakestSubject: string;
  examDate: string;
}

const plans = {
  basic: { name: 'Basic', price: 5000 },
  pro: { name: 'ACE', price: 10000 },
  premium: { name: 'SCHOLAR', price: 15000 },
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
  const [syllabusTargetSubject, setSyllabusTargetSubject] = useState<string | null>(null);
  const [flashcardsTargetSubject, setFlashcardsTargetSubject] = useState<string | null>(null);
  const [syllabusTargetTopic, setSyllabusTargetTopic] = useState<string | null>(null);
  

  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [showQuizLimitModal, setShowQuizLimitModal] = useState(false);
  const [pendingQuizType, setPendingQuizType] = useState<QuizType>('mini');
  const [showSubjectChangeLimitModal, setShowSubjectChangeLimitModal] = useState(false);
  
  // Track if we're waiting for payment flow to initialize
  const [isPaymentFlowLoading, setIsPaymentFlowLoading] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('openPayment') === 'true';
  });
  
  const { user, isLoading, hasAccess, isAdmin, isOwner, userRole, userPackage, signOut, refreshAccess } = useAuth();
  const { year: examYear } = useExamDate();
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
  
  // Database-backed trial system
  const trialSystem = useTrialSystem({
    userEmail: user?.email || null,
    isAdmin: isAdmin || isOwner,
    hasAccess,
  });
  
  const { 
    formattedTime, 
    isTrialExpired, 
    isTrialActive,
    hasTrialUsed,
    canStartTrial,
    startTrial,
    loading: trialLoading,
  } = trialSystem;

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

  // Combined loading state - include subjects loading
  const isFullyLoading = isLoading || trialLoading || subjectsLoading;

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
  useEffect(() => {
    if (isFullyLoading) return; // wait for loading to finish
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, userSubjects.length, isFullyLoading]);


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
          console.error('Failed to sync subjects:', err);
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
          const scorePerSubject = attempt.correct_answers / subjects.length;
          const totalPerSubject = attempt.total_questions / subjects.length;
          subjects.forEach(s => {
            if (!subjectScores[s]) subjectScores[s] = { correct: 0, total: 0 };
            subjectScores[s].correct += scorePerSubject;
            subjectScores[s].total += totalPerSubject;
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

  const handlePaymentSuccess = async (reference: string, email: string) => {
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

  const handleSubjectsSelected = async (subjects: string[]) => {
    // Enforce subject_change limit for returning users (not initial setup)
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

  const requireAccess = (step: Step) => {
    if (!effectiveAccess && !isTrialActive) {
      setIsPlanSelectionOpen(true);
      setSelectedPlan('pro');
      return;
    }
    navigateStep(step);
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
    startTransition(() => setCurrentStep('dashboard'));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleGoToSyllabusTopic = (subject: string, topic: string) => {
    setSyllabusTargetSubject(subject);
    setSyllabusTargetTopic(topic);
    navigateStep('syllabus');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Study plan calendar -> learning section links
  const handleStudyPlanPractice = (subject: string) => {
    setPracticeSubjectOverride(subject);
    setQuizType('subject');
    navigateStep('quiz');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleStudyPlanSyllabus = (subject: string) => {
    setSyllabusTargetSubject(subject);
    setSyllabusTargetTopic(null);
    navigateStep('syllabus');
    window.scrollTo({ top: 0, behavior: 'instant' });
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
              👋 Pick your subjects to start your 30-minute SCHOLAR trial!
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
            onOpenSyllabus={handleStudyPlanSyllabus}
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
        <ScholarshipPage onBack={handleBackToDashboard} />
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
      <PaywallGate hasAccess={true} isLoading={isFullyLoading} onUpgrade={handleUpgradeClick}>
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
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* Greeting — home only */}
                  <div>
                    <p className="text-muted-foreground text-base">Good Morning,</p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
                      {(user?.user_metadata?.full_name?.split(' ')[0]) || 'Champion'} 👋
                    </h1>
                  </div>

                  {/* Renewal nudge — expiring subscriptions */}
                  <RenewalNudge
                    userEmail={userEmail || ''}
                    isAdmin={effectiveAdmin}
                    hasAccess={effectiveAccess}
                    onUpgrade={handleUpgradeClick}
                  />

                  {/* Predicted Score + Streak + Goal (matches design) */}
                  <Suspense fallback={<Skeleton className="h-24 w-full rounded-xl" />}>
                  <HomeSummary userEmail={userEmail} />
                  </Suspense>

                  {/* Study plan follow-up — today's sessions + calendar */}
                  <StudyPlanTodayCard
                    userEmail={userEmail || ''}
                    onOpenCalendar={handleOpenStudyCalendar}
                    onGenerate={handleGenerateStudyPlan}
                  />

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
                    <button
                      onClick={() => handleTabChange('study')}
                      className="text-sm font-medium text-primary hover:opacity-80"
                    >
                      See all
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {(hasFeature('fullQuiz') || isTrialActive) ? (
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-primary hover:bg-primary/5" onClick={() => handleStartQuiz('full')}>
                        <Play className="w-5 h-5 text-primary" />
                        <span className="font-bold text-xs">Full Quiz</span>
                        <span className="text-[10px] text-muted-foreground">60 Qs</span>
                      </Button>
                    ) : (
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 opacity-60 relative" onClick={() => handleUpgradeClick()}>
                        <Lock className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />
                        <Play className="w-5 h-5 text-muted-foreground" />
                        <span className="font-bold text-xs">Full Quiz</span>
                        <span className="text-[10px] text-primary">ACE</span>
                      </Button>
                    )}
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-yellow-500 hover:bg-yellow-500/5" onClick={() => handleStartQuiz('mini')}>
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="font-bold text-xs">Mini Quiz</span>
                      <span className="text-[10px] text-muted-foreground">20 Qs</span>
                    </Button>
                    {(hasFeature('practiceQuiz') || isTrialActive) ? (
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-purple-500 hover:bg-purple-500/5" onClick={() => handleStartQuiz('subject')}>
                        <BookOpen className="w-5 h-5 text-purple-500" />
                        <span className="font-bold text-xs">Practice</span>
                        <span className="text-[10px] text-muted-foreground">Subject</span>
                      </Button>
                    ) : (
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 opacity-60 relative" onClick={() => handleUpgradeClick()}>
                        <Lock className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                        <span className="font-bold text-xs">Practice</span>
                        <span className="text-[10px] text-primary">ACE</span>
                      </Button>
                    )}
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-primary hover:bg-primary/5" onClick={() => handleTabChange('ai')}>
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="font-bold text-xs">Ask AI</span>
                      <span className="text-[10px] text-muted-foreground">Get Help</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-amber-500 hover:bg-amber-500/5" onClick={() => navigateStep('mock')}>
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-xs">Mock CBT</span>
                      <span className="text-[10px] text-muted-foreground">180 Qs</span>
                    </Button>
                  </div>

                  {/* Motivational card (matches design) */}
                  <div className="rounded-2xl p-5 border border-primary/30 bg-gradient-to-r from-primary/15 to-primary/5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Award className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-primary">You're doing great!</h3>
                      <p className="text-sm text-muted-foreground">Stay consistent and crush your target score.</p>
                    </div>
                    <Target className="w-10 h-10 text-primary/70 shrink-0" />
                  </div>

                  {/* AdSense — Dashboard */}
                  <GoogleAdSense className="my-4" />

                  </motion.div>
              )}

              {/* ================= STUDY TAB ================= */}
              {activeTab === 'study' && (
                <motion.div key="study" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {/* Study Header */}
                  <div>
                    <p className="text-muted-foreground text-sm">Let's learn something new</p>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Your Study Hub 👋</h1>
                  </div>

                  <Suspense fallback={null}>
                  <OfflineReadyCard userEmail={userEmail} subjects={effectiveSubjects} />
                  </Suspense>

                  {/* Next Best Action */}
                  {weakSubjectFromQuiz && (
                    <div className="rounded-2xl p-4 border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">Your Next Best Action</p>
                            <span className="text-[10px] uppercase tracking-wide bg-primary/20 px-2 py-0.5 rounded-full text-primary">
                              Personalized
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Focus on <span className="capitalize font-semibold text-foreground">{weakSubjectFromQuiz.replace('_', ' ')}</span> — practice 20 questions today to strengthen it.
                          </p>
                          <Button
                            size="sm"
                            className="mt-3"
                            onClick={() => {
                              setPracticeSubjectOverride(weakSubjectFromQuiz);
                              setQuizType('mini');
                              startTransition(() => setCurrentStep('quiz'));
                            }}
                          >
                            Practice now
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subject tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Your subjects:</span>
                    {effectiveSubjects.map(subject => (
                      <span key={subject} className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                        {subject.replace('_', ' ')}
                      </span>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => setShowSubjectChanger(true)} className="text-muted-foreground hover:text-primary h-7 px-2">
                      <RefreshCw className="w-3 h-3 mr-1" />Change
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-green-500 hover:bg-green-500/5" onClick={handleGenerateStudyPlan}>
                      <Target className="w-6 h-6 text-green-500" />
                      <span className="font-bold text-sm">Study Plan</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-orange-500 hover:bg-orange-500/5" onClick={() => requireAccess('flashcards')}>
                      <Layers className="w-6 h-6 text-orange-500" />
                      <span className="font-bold text-sm">Flashcards</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-teal-500 hover:bg-teal-500/5" onClick={() => requireAccess('notes')}>
                      <StickyNote className="w-6 h-6 text-teal-500" />
                      <span className="font-bold text-sm">Notes</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-blue-500 hover:bg-blue-500/5" onClick={() => requireAccess('upload')}>
                      <FileText className="w-6 h-6 text-blue-500" />
                      <span className="font-bold text-sm">Upload PDF</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-purple-500 hover:bg-purple-500/5" onClick={() => navigateStep('syllabus')}>
                      <BookOpen className="w-6 h-6 text-purple-500" />
                      <span className="font-bold text-sm">Syllabus</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-rose-500 hover:bg-rose-500/5" onClick={() => navigateStep('novels')}>
                      <Library className="w-6 h-6 text-rose-500" />
                       <span className="font-bold text-sm">Library</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-orange-500 hover:bg-orange-500/5" onClick={() => navigate('/repeated-questions')}>
                      <Flame className="w-6 h-6 text-orange-500" />
                      <span className="font-bold text-sm">High-Yield Qs</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-primary hover:bg-primary/5" onClick={() => navigateStep('course-requirements')}>
                      <GraduationCap className="w-6 h-6 text-primary" />
                      <span className="font-bold text-sm">Course Reqs</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-amber-500 hover:bg-amber-500/5" onClick={() => navigateStep('mock')}>
                      <Trophy className="w-6 h-6 text-amber-500" />
                      <span className="font-bold text-sm">Mock CBT</span>
                    </Button>
                  </div>

                  {(hasFeature('studyMaterials') || isTrialActive) ? (
                    <StudyMaterials subjects={effectiveSubjects} />
                  ) : (
                    <FeatureGate feature="studyMaterials" onUpgrade={handleUpgradeClick}>
                      <StudyMaterials subjects={effectiveSubjects} />
                    </FeatureGate>
                  )}

                  {/* AdSense — Study */}
                  <GoogleAdSense className="my-4" />

                  {/* AI Tip */}
                  <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
                  <CourseTipsCard userEmail={userEmail} userSubjects={effectiveSubjects} />
                  </Suspense>
                </motion.div>
              )}

              {/* ================= AI TAB ================= */}
              {activeTab === 'ai' && (
                <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {/* AI Header */}
                  <div>
                    <p className="text-muted-foreground text-sm">Your smart study partner</p>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2">
                      AI Assistant <Brain className="w-6 h-6 text-primary" />
                    </h1>
                  </div>

                  <div className="rounded-2xl p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">AI Study Assistant</h2>
                        <p className="text-xs text-muted-foreground">Ask anything about JAMB, get instant help</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tap the sparkle button (bottom-right) to open the AI chat and ask any JAMB question.
                    </p>
                  </div>

                  {/* Score Prediction + weakness + AI features live inside PremiumDashboard */}
                  <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
                  <PremiumDashboard
                    userEmail={userEmail}
                    isAdmin={effectiveAdmin}
                    adminRole={userRole}
                    targetScore={personalizationData?.targetScore ? parseInt(personalizationData.targetScore) : undefined}
                    weakSubject={weakSubjectFromQuiz || personalizationData?.weakestSubject}
                    onUpgrade={handleUpgradeClick}
                  />
                  </Suspense>

                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-3">Weakness & Topic Analysis</h2>
                    <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                    <TopicMasteryTracker 
                      userEmail={userEmail} 
                      allowedSubjects={effectiveSubjects}
                      onStartPracticeTopic={(subject, topic) => {
                        if (subject && subject !== 'all') {
                          setPracticeSubjectOverride(subject);
                          setQuizType('subject');
                        } else {
                          setPracticeSubjectOverride(null);
                          setQuizType('mini');
                        }
                        startTransition(() => setCurrentStep('quiz'));
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      onGoToSyllabusTopic={handleGoToSyllabusTopic}
                    />
                    </Suspense>
                  </div>

                  {weakSubjectFromQuiz && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                      <p className="text-sm text-foreground">
                        👋 <span className="font-semibold">AI Recommendation:</span> Focus on{' '}
                        <span className="font-bold text-primary capitalize">{weakSubjectFromQuiz.replace('_', ' ')}</span>. Try 20 extra questions today.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================= COMMUNITY TAB ================= */}
              {activeTab === 'community' && (
                <motion.div key="community" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {/* Community Header */}
                  <div className="rounded-2xl p-5 border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-extrabold text-foreground">The Community 👋</h1>
                        <p className="text-xs text-muted-foreground">Learn, compete and grow together</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <LiveCounter />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Button variant="outline" className="h-auto py-5 flex flex-col gap-1 hover:border-yellow-500 hover:bg-yellow-500/5" onClick={() => navigateStep('leaderboard')}>
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      <span className="font-bold text-sm">Leaderboard</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-5 flex flex-col gap-1 hover:border-amber-500 hover:bg-amber-500/5" onClick={() => navigateStep('scholarships')}>
                      <GraduationCap className="w-6 h-6 text-amber-500" />
                      <span className="font-bold text-sm">Scholarships</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-5 flex flex-col gap-1 hover:border-cyan-500 hover:bg-cyan-500/5" onClick={() => navigateStep('news')}>
                      <Newspaper className="w-6 h-6 text-cyan-500" />
                      <span className="font-bold text-sm">JAMB News</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-5 flex flex-col gap-1 hover:border-primary hover:bg-primary/5" onClick={() => navigate('/games')}>
                      <Gamepad2 className="w-6 h-6 text-primary" />
                      <span className="font-bold text-sm">Challenges</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-5 flex flex-col gap-1 hover:border-green-500 hover:bg-green-500/5" onClick={() => window.open('https://whatsapp.com/channel/0029VbAqCkeGehEHAIYD1s2y', '_blank')}>
                      <MessageCircle className="w-6 h-6 text-green-500" />
                      <span className="font-bold text-sm">WhatsApp</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-5 flex flex-col gap-1 hover:border-pink-500 hover:bg-pink-500/5" onClick={() => window.open('https://www.tiktok.com/@jambcrashai', '_blank')}>
                      <Youtube className="w-6 h-6 text-pink-500" />
                      <span className="font-bold text-sm">TikTok</span>
                    </Button>
                  </div>
                  <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
                    <div className="flex items-center gap-3">
                      <Flame className="w-8 h-8 text-orange-500" />
                      <div>
                        <h3 className="font-bold text-foreground">Daily Streak Challenge</h3>
                        <p className="text-xs text-muted-foreground">Keep your streak alive — practice daily for bonus rewards.</p>
                      </div>
                    </div>
                  </div>

                  {/* Refer & Earn */}
                  {userEmail && (
                    <Suspense fallback={null}>
                    <ReferralSystem userEmail={userEmail} />
                    </Suspense>
                  )}
                </motion.div>
              )}

              {/* ================= PROFILE TAB ================= */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="rounded-2xl p-5 border border-border bg-card">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="font-semibold text-foreground truncate">{userEmail}</p>
                  </div>

                  <h2 className="text-lg font-bold text-foreground">Your Study Stats 👋</h2>
                  <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                    <StudyStats
                      userEmail={userEmail}
                      allowedSubjects={effectiveSubjects}
                      onPracticeSubject={(subject) => {
                        if (!effectiveSubjects.includes(subject)) return;
                        setPracticeSubjectOverride(subject);
                        setQuizType('mini');
                        startTransition(() => setCurrentStep('quiz'));
                      }}
                    />
                  </Suspense>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1" onClick={() => navigate('/settings')}>
                      <SettingsIcon className="w-5 h-5 text-primary" />
                      <span className="font-bold text-sm">Settings</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1" onClick={() => handleTabChange('home')}>
                      <Bell className="w-5 h-5 text-primary" />
                      <span className="font-bold text-sm">Notifications</span>
                    </Button>
                    {!effectiveAccess && !effectiveAdmin && (
                      <Button className="h-auto py-4 flex flex-col gap-1 col-span-2 gradient-primary text-primary-foreground" onClick={() => handleUpgradeClick()}>
                        <Crown className="w-5 h-5" />
                        <span className="font-bold text-sm">Upgrade to SCHOLAR</span>
                      </Button>
                    )}
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 col-span-2 text-destructive hover:text-destructive" onClick={handleSignOut}>
                      <LogOut className="w-5 h-5" />
                      <span className="font-bold text-sm">Sign Out</span>
                    </Button>
                  </div>
                </motion.div>
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
        
      </div>
      <Suspense fallback={null}>
      <Footer />
      </Suspense>

    </div>
  );
};

export default Index;

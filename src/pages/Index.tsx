import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { DashboardHeader } from '@/components/DashboardHeader';
import { HeroSection } from '@/components/HeroSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { PricingSection } from '@/components/PricingSection';
import { UploadSection } from '@/components/UploadSection';
import { PersonalizationForm } from '@/components/PersonalizationForm';
import { PaymentModal } from '@/components/PaymentModal';
import { PlanSelectionModal } from '@/components/PlanSelectionModal';
import { PaywallGate } from '@/components/PaywallGate';
import { AdminBadge } from '@/components/AdminBadge';
import { PremiumDashboard } from '@/components/PremiumDashboard';
import { SubjectSelector } from '@/components/SubjectSelector';
import { SubjectChanger } from '@/components/SubjectChanger';
import { TimedQuiz } from '@/components/TimedQuiz';
import { QuizResults } from '@/components/QuizResults';
import { StudyStats } from '@/components/StudyStats';
import { StudyPlanGenerator } from '@/components/StudyPlanGenerator';
import { StudyMaterials } from '@/components/StudyMaterials';
import { SyllabusReader } from '@/components/SyllabusReader';
import { Flashcards } from '@/components/Flashcards';
import { CourseRequirements } from '@/components/CourseRequirements';
import { CourseTipsCard } from '@/components/CourseTipsCard';
import { TrialExpiredScreen } from '@/components/TrialExpiredScreen';
import { UsageLimitIndicator } from '@/components/UsageLimitIndicator';
import { TrialTimerBadge } from '@/components/TrialTimerBadge';
import { Footer } from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { FeatureGate, useFeatureAccess } from '@/components/FeatureGate';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialSystem } from '@/hooks/useTrialSystem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, FileText, Target, Calendar, BookOpen, Zap, LogOut, Lock, RefreshCw, Layers, X, GraduationCap, Library, Newspaper, Trophy, Repeat } from 'lucide-react';
import { JambNewsPage } from '@/components/JambNewsPage';
import { ScholarshipPage } from '@/components/ScholarshipPage';
import { NovelBrowser, NovelDetail, NovelReader } from '@/components/novels';
import { PaymentCancelledModal } from '@/components/PaymentCancelledModal';
import { Leaderboard } from '@/components/Leaderboard';
import { BannerAd } from '@/components/BannerAd';

type Step = 'landing' | 'subject-select' | 'upload' | 'personalize' | 'processing' | 'dashboard' | 'quiz' | 'quiz-results' | 'study-plan' | 'study-materials' | 'syllabus' | 'flashcards' | 'course-requirements' | 'novels' | 'novel-detail' | 'novel-reader' | 'news' | 'scholarships' | 'leaderboard';
type QuizType = 'full' | 'mini' | 'subject' | 'timed-practice';

interface FormData {
  targetScore: string;
  hoursPerDay: string;
  weakestSubject: string;
  examDate: string;
}

const plans = {
  basic: { name: 'Basic', price: 5000 },
  pro: { name: 'Pro', price: 10000 },
  premium: { name: 'Premium', price: 15000 },
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
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPlanSelectionOpen, setIsPlanSelectionOpen] = useState(false);
  const [personalizationData, setPersonalizationData] = useState<FormData | null>(null);
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true); // Track if subjects are still loading
  const [quizType, setQuizType] = useState<QuizType>('full');
  const [quizResults, setQuizResults] = useState<any>(null);
  const [highlightStandard, setHighlightStandard] = useState(false);
  const [weakSubjectFromQuiz, setWeakSubjectFromQuiz] = useState<string | null>(null);
  const [showSubjectChanger, setShowSubjectChanger] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  
  // Track if user just paid successfully (to prevent showing trial expired screen)
  const [justPaidForPlan, setJustPaidForPlan] = useState(false);
  
  // Track payment cancellation for choice modal
  const [showPaymentCancelledModal, setShowPaymentCancelledModal] = useState(false);
  const [paymentWasCancelled, setPaymentWasCancelled] = useState(false);
  
  // Track if we're waiting for payment flow to initialize
  const [isPaymentFlowLoading, setIsPaymentFlowLoading] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('openPayment') === 'true';
  });
  
  const { user, isLoading, hasAccess, isAdmin, isOwner, userRole, signOut, refreshAccess } = useAuth();
  const navigate = useNavigate();
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

  const userEmail = user?.email?.toLowerCase() || null;
  const effectiveAccess = hasAccess || isOwner || isAdmin;
  const effectiveAdmin = isAdmin || isOwner;
  const effectiveOwner = isOwner;
  const effectiveSubjects = userSubjects.length > 0 ? userSubjects : DEFAULT_SUBJECTS;

  // Combined loading state - include subjects loading
  const isFullyLoading = isLoading || trialLoading || subjectsLoading;

  // Admins/owners can use dashboard normally - no auto-redirect
  // They access admin panel via the gear (Shield) icon in header
  
  // Auto-redirect logic for all users
  useEffect(() => {
    if (isFullyLoading) return;
    
    // Skip auto-redirect if user is in payment flow
    const openPayment = searchParams.get('openPayment');
    if (openPayment === 'true' || isPaymentModalOpen || isPlanSelectionOpen) {
      return; // Don't interfere with payment flow
    }
    
    // Admins/owners have full access - treat them like paid users
    const hasFullAccess = effectiveAccess || isAdmin || isOwner;
    
    // If user is signed in and has access (paid OR admin), go to dashboard
    if (userEmail && hasFullAccess && currentStep === 'landing') {
      // Only prompt for subjects if they don't have any
      if (userSubjects.length === 0 && !isAdmin && !isOwner) {
        setCurrentStep('subject-select');
      } else {
        setCurrentStep('dashboard');
        saveDashboardState('dashboard');
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    
    // Trial users: if logged in and has active trial → go to dashboard
    if (userEmail && !hasFullAccess && isTrialActive && currentStep === 'landing') {
      if (userSubjects.length === 0) {
        setCurrentStep('subject-select');
      } else {
        setCurrentStep('dashboard');
        saveDashboardState('dashboard');
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    
    // New user (no trial used yet) - show subject selection to start trial
    if (userEmail && !hasFullAccess && !hasTrialUsed && canStartTrial && currentStep === 'landing') {
      setCurrentStep('subject-select');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [userEmail, effectiveAccess, isAdmin, isOwner, isFullyLoading, currentStep, isTrialActive, hasTrialUsed, canStartTrial, userSubjects.length, searchParams, isPaymentModalOpen, isPlanSelectionOpen]);

  // Load user subjects
  useEffect(() => {
    const loadUserData = async () => {
      if (!userEmail) {
        setSubjectsLoading(false);
        return;
      }
      if (isLoading) return;
      
      setSubjectsLoading(true);
      
      const { data } = await supabase
        .from('user_subjects')
        .select('subjects')
        .eq('email', userEmail)
        .maybeSingle(); // Use maybeSingle to avoid errors when no data
      
      if (data?.subjects) {
        setUserSubjects(data.subjects as string[]);
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
      setCurrentStep('dashboard');
      setSearchParams({});
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    
    if (isFullyLoading) return;
    
    if (step === 'upload' && userEmail) {
      if (userSubjects.length === 0 && !effectiveAdmin) {
        setCurrentStep('subject-select');
      } else {
        setCurrentStep('upload');
      }
      setSearchParams({});
    } else if (step === 'dashboard' && userEmail && (effectiveAccess || isTrialActive)) {
      setCurrentStep('dashboard');
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

  const handleStartFreeTrial = () => {
    // Always require authentication first
    if (!user) {
      navigate('/auth', { state: { flow: 'trial' } });
      return;
    }
    
    // If user can start trial, go to subject selection
    if (canStartTrial) {
      setCurrentStep('subject-select');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (hasTrialUsed) {
      toast.error('You have already used your free trial. Please upgrade to continue.');
      handleUpgradeClick();
    }
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

  const handleTrialFromPlanModal = () => {
    setIsPlanSelectionOpen(false);
    // If not logged in, redirect to auth with trial flow
    if (!user) {
      navigate('/auth', { state: { flow: 'trial' } });
      return;
    }
    setCurrentStep('subject-select');
    window.scrollTo({ top: 0, behavior: 'instant' });
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
    // If user is logged in and eligible for trial, show choice modal
    if (user && canStartTrial && !hasAccess && !effectiveAdmin) {
      setPaymentWasCancelled(true);
      setShowPaymentCancelledModal(true);
    }
  };

  const handlePaymentCancelledTrial = async () => {
    setShowPaymentCancelledModal(false);
    setPaymentWasCancelled(false);
    // Start trial flow
    if (canStartTrial) {
      setCurrentStep('subject-select');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handlePaymentCancelledRetry = () => {
    setShowPaymentCancelledModal(false);
    setPaymentWasCancelled(false);
    // Reopen payment modal
    if (selectedPlan) {
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = async (reference: string, email: string) => {
    setIsPaymentModalOpen(false);
    setJustPaidForPlan(true); // Immediately mark as paid to bypass trial expired check
    await refreshAccess();
    toast.success('Payment successful! 🎉 Let\'s pick your subjects!');
    setCurrentStep('subject-select');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSubjectsSelected = async (subjects: string[]) => {
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
      console.log('[Payment] Found pending payment, waiting for verification...');
      // Wait 2 seconds for webhook/verification to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refreshAccess();
    }
    
    // Double-check access with fresh database query to ensure we have latest payment status
    const { data: accessData } = await supabase.rpc('check_user_access', { 
      user_email: userEmail || '' 
    });
    
    const currentAccess = accessData?.[0]?.has_access || false;
    
    // Only start trial if user truly has no access AND no pending payment
    if (!currentAccess && !effectiveAdmin && canStartTrial && !pendingPayment) {
      const success = await startTrial();
      if (success) {
        toast.success('🎉 30-minute Premium trial started! Enjoy full access!');
      }
    } else if (currentAccess && !effectiveAdmin) {
      toast.success('🎉 Payment confirmed! Enjoy your subscription!');
    } else if (pendingPayment) {
      // Payment is being processed
      toast.info('Your payment is being processed...');
    }
    
    setCurrentStep('dashboard');
    saveDashboardState('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleUploadComplete = (files: File[]) => {
    toast.success(`${files.length} file(s) processed! Questions extracted. ✨`);
    // Stay on the upload page to show results - don't redirect
  };

  const handleFormSubmit = (data: unknown) => {
    setPersonalizationData(data as FormData);
    toast.success('Creating your personalized study plan... 🚀');
    setCurrentStep('study-plan');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleGenerateStudyPlan = () => {
    setCurrentStep('study-plan');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleStartQuiz = (type: QuizType) => {
    setQuizType(type);
    setCurrentStep('quiz');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleQuizComplete = (results: any) => {
    setQuizResults(results);
    setCurrentStep('quiz-results');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleUpgradeClick = (plan?: string) => {
    // If a specific plan is passed, open payment modal directly
    if (plan && plans[plan as keyof typeof plans]) {
      setSelectedPlan(plan as keyof typeof plans);
      setIsPaymentModalOpen(true);
      return;
    }
    
    // Otherwise scroll to pricing
    localStorage.removeItem(DASHBOARD_STATE_KEY);
    setCurrentStep('landing');
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

  const handleSignOut = async () => {
    localStorage.removeItem(DASHBOARD_STATE_KEY);
    await signOut();
    setCurrentStep('landing');
    setUserSubjects([]);
    setPersonalizationData(null);
    navigate('/');
    toast.success('Signed out successfully');
  };

  const handleBackToDashboard = () => {
    setCurrentStep('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSubjectsChanged = async (subjects: string[]) => {
    setUserSubjects(subjects);
    setShowSubjectChanger(false);
    setWeakSubjectFromQuiz(null);
    setQuizResults(null);
    toast.success('Subjects updated! App data refreshed. 🎉');
  };

  // Payment flow loading - show loading screen while waiting for payment modal
  if (isPaymentFlowLoading && (isLoading || !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Preparing your payment...</p>
        </motion.div>
      </div>
    );
  }

  // Loading screen for authenticated users to prevent flash/glitch
  if (isFullyLoading && userEmail && currentStep === 'landing') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Trial expired - show upgrade screen with payment modal
  if (isTrialExpired && !effectiveAccess && !effectiveAdmin && !justPaidForPlan) {
    return (
      <>
        <TrialExpiredScreen onUpgrade={handleUpgradeClick} />
        
        {/* Payment Modal - must be included here for expired trial users */}
        {selectedPlan && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={handlePaymentModalClose}
            plan={plans[selectedPlan]}
            onSuccess={handlePaymentSuccess}
            initialEmail={userEmail || undefined}
          />
        )}
      </>
    );
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
          <TimedQuiz
            userEmail={userEmail}
            subjects={effectiveSubjects}
            quizType={quizType}
            onComplete={handleQuizComplete}
            onExit={handleBackToDashboard}
          />
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
          <QuizResults
            results={quizResults}
            quizType={quizType}
            onRetry={handleBackToDashboard}
            onHome={handleBackToDashboard}
          />
        </div>
      </div>
    );
  }

  // Subject selection step
  if (currentStep === 'subject-select' && userEmail) {
    // Admins with no subjects selected - go to dashboard (they have full access)
    if (effectiveAdmin) {
      setCurrentStep('dashboard');
      return null;
    }
    
    const isTrialEntry = !effectiveAccess && canStartTrial;
    
    return (
      <div className="min-h-screen bg-background">
        {!isTrialEntry && (
          <BackButton onClick={() => setCurrentStep('landing')} />
        )}
        <SubjectSelector
          userEmail={userEmail}
          onComplete={handleSubjectsSelected}
          isBypassUser={effectiveAdmin}
        />
        {isTrialEntry && (
          <div className="fixed bottom-4 left-0 right-0 text-center">
            <p className="text-sm text-muted-foreground">
              🎁 Pick your subjects to start your 30-minute Premium trial!
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
          <SyllabusReader
            userEmail={userEmail}
            subjects={effectiveSubjects}
            onBack={handleBackToDashboard}
          />
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
          <CourseRequirements
            userSubjects={effectiveSubjects}
            onBack={handleBackToDashboard}
          />
        </div>
      </div>
    );
  }

  // Novels step
  if (currentStep === 'novels' && userEmail) {
    return (
      <NovelBrowser
        userEmail={userEmail}
        onBack={handleBackToDashboard}
        onSelectNovel={(novelId) => {
          setSelectedNovelId(novelId);
          setCurrentStep('novel-detail');
        }}
      />
    );
  }

  // Novel Detail step
  if (currentStep === 'novel-detail' && userEmail && selectedNovelId) {
    return (
      <NovelDetail
        novelId={selectedNovelId}
        userEmail={userEmail}
        onBack={() => setCurrentStep('novels')}
        onStartReading={(chapterId) => {
          setSelectedChapterId(chapterId);
          setCurrentStep('novel-reader');
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
        onBack={() => setCurrentStep('novel-detail')}
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
        <Footer />
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
          <PersonalizationForm onSubmit={handleFormSubmit} />
        </div>
        <Footer />
      </div>
    );
  }

  // Dashboard step
  if (currentStep === 'dashboard' && userEmail) {
    return (
      <PaywallGate hasAccess={effectiveAccess || isTrialActive} isLoading={isFullyLoading} onUpgrade={handleUpgradeClick}>
        <div className="min-h-screen bg-background">
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
          <div className="pt-20 pb-8 px-4">
            <div className="max-w-6xl mx-auto">
              {/* Welcome Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Welcome back, future uni star! 🌟
                </h1>
                <p className="text-muted-foreground">
                  Your personalized JAMB prep dashboard. Let's crush that 300+!
                </p>
                {isTrialActive && (
                  <p className="text-sm text-primary mt-2 font-medium">
                    🎁 Free Trial Active - {formattedTime} remaining
                  </p>
                )}
              </motion.div>

              {/* Usage Limit Indicators for Basic users */}
              <UsageLimitIndicator />

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3 mb-4"
              >
                {(hasFeature('fullQuiz') || isTrialActive) ? (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-1 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleStartQuiz('full')}
                  >
                    <Play className="w-6 h-6 text-primary" />
                    <span className="font-bold text-sm">Full Quiz</span>
                    <span className="text-xs text-muted-foreground">60 Qs</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-1 opacity-60 relative"
                    onClick={() => handleUpgradeClick()}
                  >
                    <div className="absolute top-1 right-1">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <Play className="w-6 h-6 text-muted-foreground" />
                    <span className="font-bold text-sm">Full Quiz</span>
                    <span className="text-xs text-primary">Pro+</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-yellow-500 hover:bg-yellow-500/5"
                  onClick={() => handleStartQuiz('mini')}
                >
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <span className="font-bold text-sm">Mini Quiz</span>
                  <span className="text-xs text-muted-foreground">20 Qs</span>
                </Button>
                
                {(hasFeature('practiceQuiz') || isTrialActive) ? (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-1 hover:border-purple-500 hover:bg-purple-500/5"
                    onClick={() => handleStartQuiz('subject')}
                  >
                    <BookOpen className="w-6 h-6 text-purple-500" />
                    <span className="font-bold text-sm">Practice</span>
                    <span className="text-xs text-muted-foreground">By Subject</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-1 opacity-60 relative"
                    onClick={() => handleUpgradeClick()}
                  >
                    <div className="absolute top-1 right-1">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                    <span className="font-bold text-sm">Practice</span>
                    <span className="text-xs text-primary">Pro+</span>
                  </Button>
                )}
              </motion.div>

              {/* Secondary Actions Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"
              >
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-blue-500 hover:bg-blue-500/5"
                  onClick={() => setCurrentStep('upload')}
                >
                  <FileText className="w-6 h-6 text-blue-500" />
                  <span className="font-bold text-sm">Upload PDF</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-green-500 hover:bg-green-500/5"
                  onClick={handleGenerateStudyPlan}
                >
                  <Target className="w-6 h-6 text-green-500" />
                  <span className="font-bold text-sm">Study Plan</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-purple-500 hover:bg-purple-500/5"
                  onClick={() => setCurrentStep('syllabus')}
                >
                  <BookOpen className="w-6 h-6 text-purple-500" />
                  <span className="font-bold text-sm">Syllabus</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-orange-500 hover:bg-orange-500/5"
                  onClick={() => setCurrentStep('flashcards')}
                >
                  <Layers className="w-6 h-6 text-orange-500" />
                  <span className="font-bold text-sm">Flashcards</span>
                </Button>
              </motion.div>

              {/* Tertiary Actions Row - Novels, News, Scholarships, Leaderboard, Repeated Questions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6"
              >
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-rose-500 hover:bg-rose-500/5"
                  onClick={() => setCurrentStep('novels')}
                >
                  <Library className="w-6 h-6 text-rose-500" />
                  <span className="font-bold text-sm">JAMB Novels</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-cyan-500 hover:bg-cyan-500/5"
                  onClick={() => setCurrentStep('news')}
                >
                  <Newspaper className="w-6 h-6 text-cyan-500" />
                  <span className="font-bold text-sm">JAMB News</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-amber-500 hover:bg-amber-500/5"
                  onClick={() => setCurrentStep('scholarships')}
                >
                  <GraduationCap className="w-6 h-6 text-amber-500" />
                  <span className="font-bold text-sm">Scholarships</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-yellow-500 hover:bg-yellow-500/5"
                  onClick={() => setCurrentStep('leaderboard')}
                >
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span className="font-bold text-sm">Leaderboard</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-indigo-500 hover:bg-indigo-500/5"
                  onClick={() => navigate('/repeated-questions')}
                >
                  <Repeat className="w-6 h-6 text-indigo-500" />
                  <span className="font-bold text-sm">Repeated Qs</span>
                </Button>
              </motion.div>

              {/* Course Requirements Button */}
              {/* Course Tips Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <CourseTipsCard userEmail={userEmail} userSubjects={effectiveSubjects} />
              </motion.div>


              {/* Subject Tags with Change Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap items-center gap-2 justify-center mb-8"
              >
                <span className="text-sm text-muted-foreground">Your subjects:</span>
                {effectiveSubjects.map(subject => (
                  <span
                    key={subject}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize"
                  >
                    {subject.replace('_', ' ')}
                  </span>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubjectChanger(true)}
                  className="text-muted-foreground hover:text-primary ml-2"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Change
                </Button>
              </motion.div>

              {/* Study Materials */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                {(hasFeature('studyMaterials') || isTrialActive) ? (
                  <StudyMaterials subjects={effectiveSubjects} />
                ) : (
                  <FeatureGate feature="studyMaterials" onUpgrade={handleUpgradeClick}>
                    <StudyMaterials subjects={effectiveSubjects} />
                  </FeatureGate>
                )}
              </motion.div>

              {/* Study Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mb-8"
              >
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Your Study Stats 📊
                </h2>
                <StudyStats userEmail={userEmail} />
              </motion.div>

              {/* Premium Dashboard Features */}
              <PremiumDashboard
                userEmail={userEmail}
                isAdmin={effectiveAdmin}
                adminRole={userRole}
                targetScore={personalizationData?.targetScore ? parseInt(personalizationData.targetScore) : undefined}
                weakSubject={weakSubjectFromQuiz || personalizationData?.weakestSubject}
                onUpgrade={handleUpgradeClick}
              />

              {/* UTME Countdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 bg-gradient-to-r from-primary/20 to-green-500/20 rounded-2xl p-6 text-center border border-primary/30"
              >
                <Calendar className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-bold text-foreground mb-1">2026 UTME Countdown</h3>
                <p className="text-muted-foreground mb-3">Stay focused, stay winning! 🔥</p>
                <div className="text-4xl font-bold text-primary">
                  {Math.ceil((new Date('2026-04-25').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
                <p className="text-sm text-muted-foreground mt-2">until UTME 2026</p>
              </motion.div>

              {/* AI Tips */}
              {weakSubjectFromQuiz && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="mt-8 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30"
                >
                  <p className="text-lg text-foreground">
                    💡 <span className="font-semibold">AI Tip:</span> Based on your quiz history, focus more on{' '}
                    <span className="font-bold text-primary capitalize">{weakSubjectFromQuiz.replace('_', ' ')}</span>.{' '}
                    Try 20 extra questions today to boost your score!
                  </p>
                </motion.div>
              )}

              {/* Motivational Quote */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <p className="text-lg text-muted-foreground italic">
                  "You got this, future uni star! Every question you practice brings you closer to that 300+!" 💪
                </p>
              </motion.div>

              {/* Banner Ad for free/basic users only */}
              {!effectiveAccess && !effectiveAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <BannerAd placement="dashboard-footer" />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </PaywallGate>
    );
  }

  // Landing page
  const handleGoToDashboard = () => {
    if (userSubjects.length === 0 && !effectiveAdmin) {
      setCurrentStep('subject-select');
    } else {
      setCurrentStep('dashboard');
    }
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
        <HeroSection 
          onGetStarted={handleGetStarted} 
          hasAccess={effectiveAccess}
          onSeeHowItWorks={handleSeeHowItWorks}
        />
        <HowItWorksSection onStartTrial={handleStartFreeTrial} />
        <PricingSection onSelectPlan={handleSelectPlan} highlightStandard={highlightStandard} />
      </div>
      <Footer />

      {/* Free Trial Banner - only for non-logged-in users, with close button */}
      {!user && !effectiveAccess && !isFullyLoading && showTrialBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-primary/90 to-green-600/90 backdrop-blur-sm z-50"
        >
          <button
            onClick={() => setShowTrialBanner(false)}
            className="absolute top-2 right-2 text-white/70 hover:text-white p-1"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap pr-8">
            <div className="text-primary-foreground">
              <p className="font-bold">🎁 Free Trial Available!</p>
              <p className="text-sm opacity-90">Get 30 minutes of Premium access - No payment required</p>
            </div>
            <Button
              onClick={handleStartFreeTrial}
              className="bg-white text-primary hover:bg-white/90 font-bold"
            >
              Start Free Trial
            </Button>
          </div>
        </motion.div>
      )}

      {/* Plan Selection Modal - Trial vs Payment choice */}
      {selectedPlan && (
        <PlanSelectionModal
          isOpen={isPlanSelectionOpen}
          onClose={() => setIsPlanSelectionOpen(false)}
          planName={plans[selectedPlan].name}
          planPrice={plans[selectedPlan].price}
          onStartTrial={handleTrialFromPlanModal}
          onContinuePayment={handlePaymentFromPlanModal}
          canStartTrial={!user ? true : canStartTrial}
          hasTrialUsed={!user ? false : hasTrialUsed}
        />
      )}

      {/* Payment Modal */}
      {selectedPlan && user && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handlePaymentModalClose}
          plan={plans[selectedPlan]}
          onSuccess={handlePaymentSuccess}
          initialEmail={userEmail || undefined}
        />
      )}

      {/* Payment Cancelled Choice Modal */}
      <PaymentCancelledModal
        isOpen={showPaymentCancelledModal}
        onClose={() => setShowPaymentCancelledModal(false)}
        onStartTrial={handlePaymentCancelledTrial}
        onRetryPayment={handlePaymentCancelledRetry}
        canStartTrial={canStartTrial}
      />
    </div>
  );
};

export default Index;

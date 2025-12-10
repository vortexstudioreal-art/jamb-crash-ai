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
import { PaywallGate } from '@/components/PaywallGate';
import { AdminBadge } from '@/components/AdminBadge';
import { PremiumDashboard } from '@/components/PremiumDashboard';
import { SubjectSelector } from '@/components/SubjectSelector';
import { SubjectChanger } from '@/components/SubjectChanger';
import { FreeTrialBanner } from '@/components/FreeTrialBanner';
import { DemoQuizFlow } from '@/components/DemoQuizFlow';
import { TimedQuiz } from '@/components/TimedQuiz';
import { QuizResults } from '@/components/QuizResults';
import { StudyStats } from '@/components/StudyStats';
import { StudyPlanGenerator } from '@/components/StudyPlanGenerator';
import { StudyMaterials } from '@/components/StudyMaterials';
import { SyllabusReader } from '@/components/SyllabusReader';
import { Flashcards } from '@/components/Flashcards';
import { TrialEndedScreen } from '@/components/TrialEndedScreen';
import { TrialTimerBadge } from '@/components/TrialTimerBadge';
import { Footer } from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { FeatureGate, useFeatureAccess } from '@/components/FeatureGate';
import { FreeTrialFlow } from '@/components/FreeTrialFlow';
import { useAuth } from '@/contexts/AuthContext';
import { useFreeTrialTimer } from '@/hooks/useFreeTrialTimer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, FileText, Target, Calendar, BookOpen, Zap, LogOut, User, Lock, Crown, RefreshCw, Brain, Layers } from 'lucide-react';

type Step = 'landing' | 'subject-select' | 'upload' | 'personalize' | 'processing' | 'dashboard' | 'quiz' | 'quiz-results' | 'demo' | 'study-plan' | 'study-materials' | 'syllabus' | 'flashcards' | 'free-trial';
type QuizType = 'full' | 'mini' | 'subject' | 'timed-practice' | 'demo';

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

// Default subjects when none selected
const DEFAULT_SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry'];

// Helper to persist dashboard state
const saveDashboardState = (step: Step) => {
  if (['dashboard', 'quiz', 'quiz-results', 'study-plan', 'upload'].includes(step)) {
    localStorage.setItem(DASHBOARD_STATE_KEY, 'dashboard');
  }
};

const getSavedDashboardState = (): boolean => {
  return localStorage.getItem(DASHBOARD_STATE_KEY) === 'dashboard';
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [personalizationData, setPersonalizationData] = useState<FormData | null>(null);
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [quizType, setQuizType] = useState<QuizType>('full');
  const [quizResults, setQuizResults] = useState<any>(null);
  const [highlightStandard, setHighlightStandard] = useState(false);
  const [weakSubjectFromQuiz, setWeakSubjectFromQuiz] = useState<string | null>(null);
  const [showSubjectChanger, setShowSubjectChanger] = useState(false);
  
  const { user, isLoading, hasAccess, isAdmin, isOwner, userRole, userPackage, packageFeatures, signOut, refreshAccess } = useAuth();
  const navigate = useNavigate();
  const { hasFeature, getMaxQuizQuestions, getMaxPdfUploads } = useFeatureAccess();
  
  // Free trial timer with full state management
  const trialTimer = useFreeTrialTimer({
    userEmail: user?.email || null,
    isAdmin: isAdmin || isOwner,
    hasAccess,
  });
  
  const { 
    formattedTime, 
    isTrialExpired, 
    isInTrial, 
    hasTrialStarted,
    hasCompletedQuiz,
    trialSubjects,
    trialResults,
    timeRemaining,
    startTrial,
    saveTrialSubjects,
    saveTrialResults,
    resetTrial,
  } = trialTimer;

  // User email from authenticated session only
  const userEmail = user?.email?.toLowerCase() || null;

  // Access is determined server-side via check_user_access RPC
  const effectiveAccess = hasAccess || isOwner || isAdmin;
  const effectiveAdmin = isAdmin || isOwner;
  const effectiveOwner = isOwner;

  // ALWAYS have subjects available - use defaults if none selected
  const effectiveSubjects = userSubjects.length > 0 ? userSubjects : DEFAULT_SUBJECTS;

  // Auto-redirect logic for users
  useEffect(() => {
    if (isLoading) return;
    
    // Owner and admins go straight to dashboard
    if (userEmail && effectiveAdmin) {
      if (currentStep === 'landing') {
        setCurrentStep('dashboard');
        saveDashboardState('dashboard');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      return;
    }
    
    // If user is signed in and has PAID access, go to dashboard
    if (userEmail && effectiveAccess && currentStep === 'landing') {
      setCurrentStep('dashboard');
      saveDashboardState('dashboard');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    
    // Trial users: if logged in but no access and no trial started yet → go to subject picker FIRST
    if (userEmail && !effectiveAccess && !effectiveAdmin) {
      if (!hasTrialStarted && currentStep === 'landing') {
        console.log('[Trial] New user, redirecting to subject picker');
        setCurrentStep('subject-select');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
      
      // Trial already started (has subjects) → go to dashboard
      if (hasTrialStarted && currentStep === 'landing') {
        console.log('[Trial] Existing trial user, going to dashboard');
        setCurrentStep('dashboard');
        saveDashboardState('dashboard');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, [userEmail, effectiveAccess, effectiveAdmin, isLoading, currentStep, hasTrialStarted]);

  // Load user subjects and quiz data
  useEffect(() => {
    const loadUserData = async () => {
      if (!userEmail || isLoading) return;
      
      // Load subjects
      const { data } = await supabase
        .from('user_subjects')
        .select('subjects')
        .eq('email', userEmail)
        .single();
      
      if (data?.subjects) {
        setUserSubjects(data.subjects as string[]);
      }

      // Load weak subject from quiz history
      const { data: quizData } = await supabase
        .from('quiz_attempts')
        .select('subjects, correct_answers, total_questions')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(5);

      if (quizData && quizData.length > 0) {
        // Analyze to find weak subject
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
    
    if (step === 'dashboard' && effectiveAccess && userEmail) {
      setCurrentStep('dashboard');
      setSearchParams({});
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    
    if (isLoading) return;
    
    if (step === 'upload' && userEmail) {
      if (userSubjects.length === 0 && !effectiveAdmin) {
        setCurrentStep('subject-select');
      } else {
        setCurrentStep('upload');
      }
      setSearchParams({});
    } else if (step === 'dashboard' && userEmail && effectiveAccess) {
      setCurrentStep('dashboard');
      setSearchParams({});
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [searchParams, setSearchParams, userEmail, userSubjects.length, isLoading, effectiveAccess, effectiveAdmin]);

  // Save dashboard state when step changes
  useEffect(() => {
    saveDashboardState(currentStep);
  }, [currentStep]);

  const handleGetStarted = () => {
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
    
    // Admins/owners skip payment (verified server-side)
    if (effectiveAdmin) {
      toast.success(effectiveOwner ? 'Owner access granted! 👑' : 'Admin access granted! 🛡️');
      setCurrentStep('dashboard');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    
    if (effectiveAccess) {
      if (userSubjects.length === 0) {
        setCurrentStep('subject-select');
      } else {
        setCurrentStep('dashboard');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      return;
    }
    
    if (!user) {
      navigate('/auth', { state: { returnTo: '/', selectedPlan: planKey } });
      return;
    }
    
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (reference: string, email: string) => {
    setIsPaymentModalOpen(false);
    await refreshAccess();
    toast.success('Payment successful! 🎉 Let\'s pick your subjects!');
    setCurrentStep('subject-select');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSubjectsSelected = (subjects: string[]) => {
    setUserSubjects(subjects);
    
    // Start the 30-minute trial timer NOW (after subject selection) - only for non-paid, non-admin users
    if (!effectiveAccess && !effectiveAdmin) {
      console.log('[Trial] Starting 30-min Pro trial after subject selection');
      startTrial();
    }
    
    setCurrentStep('dashboard');
    saveDashboardState('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
    toast.success('🎉 30-minute Pro trial started! Enjoy full access!');
  };

  const handleUploadComplete = (files: File[]) => {
    toast.success(`${files.length} file(s) ready for AI magic! ✨`);
    setCurrentStep('personalize');
    window.scrollTo({ top: 0, behavior: 'instant' });
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

  const handleStartTrial = () => {
    setCurrentStep('demo');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleUpgradeClick = () => {
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
    
    // Force refresh all data based on new subjects
    if (userEmail) {
      // Clear cached quiz data
      setWeakSubjectFromQuiz(null);
      setQuizResults(null);
      
      // Reload quiz history for new weak subject analysis
      const { data: quizData } = await supabase
        .from('quiz_attempts')
        .select('subjects, correct_answers, total_questions')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(5);

      if (quizData && quizData.length > 0) {
        const subjectScores: Record<string, { correct: number; total: number }> = {};
        quizData.forEach(attempt => {
          const attemptSubjects = attempt.subjects as string[];
          const scorePerSubject = attempt.correct_answers / attemptSubjects.length;
          const totalPerSubject = attempt.total_questions / attemptSubjects.length;
          attemptSubjects.forEach(s => {
            if (!subjectScores[s]) subjectScores[s] = { correct: 0, total: 0 };
            subjectScores[s].correct += scorePerSubject;
            subjectScores[s].total += totalPerSubject;
          });
        });

        let worstSubject = '';
        let worstRate = 1;
        Object.entries(subjectScores).forEach(([subject, scores]) => {
          const rate = scores.correct / scores.total;
          if (rate < worstRate && subjects.map(s => s.toLowerCase()).includes(subject.toLowerCase())) {
            worstRate = rate;
            worstSubject = subject;
          }
        });
        if (worstSubject) setWeakSubjectFromQuiz(worstSubject);
      }
    }
    
    toast.success('Subjects updated! App data refreshed. 🎉');
  };

  // Trial expired - show upgrade screen
  if (isTrialExpired && !effectiveAccess && !effectiveAdmin) {
    return <TrialEndedScreen onUpgrade={handleUpgradeClick} />;
  }

  // Quiz step
  if (currentStep === 'quiz' && userEmail) {
    return (
      <div className="min-h-screen bg-background">
        {isInTrial && formattedTime && (
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

  // Demo quiz flow
  if (currentStep === 'demo') {
    return (
      <>
        <BackButton onClick={() => setCurrentStep('landing')} />
        <DemoQuizFlow
          onComplete={() => setCurrentStep('landing')}
          onUpgrade={handleUpgradeClick}
        />
      </>
    );
  }

  // Subject selection step - first step for trial users
  if (currentStep === 'subject-select' && userEmail) {
    if (effectiveAdmin) {
      setCurrentStep('dashboard');
      return null;
    }
    
    // Don't show back button for trial users (subject selection is their entry point)
    const isTrialEntry = !effectiveAccess && !hasTrialStarted;
    
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
              🎁 Pick your subjects to start your 30-minute Pro trial!
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
      <PaywallGate hasAccess={effectiveAccess || isInTrial} isLoading={isLoading} onUpgrade={handleUpgradeClick}>
        <div className="min-h-screen bg-background">
          {/* Trial Timer Badge */}
          {isInTrial && formattedTime && (
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
          {/* No back button on dashboard - it's the home page */}
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
              </motion.div>

              {/* Quick Actions - Trial users get FULL Pro features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3 mb-4"
              >
                {/* Full Quiz - Pro+ only OR trial users */}
                {(hasFeature('fullQuiz') || isInTrial) ? (
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
                    onClick={handleUpgradeClick}
                  >
                    <div className="absolute top-1 right-1">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <Play className="w-6 h-6 text-muted-foreground" />
                    <span className="font-bold text-sm">Full Quiz</span>
                    <span className="text-xs text-primary">Pro+</span>
                  </Button>
                )}
                
                {/* Mini Quiz - Available to all (trial gets 20 Qs) */}
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-1 hover:border-yellow-500 hover:bg-yellow-500/5"
                  onClick={() => handleStartQuiz('mini')}
                >
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <span className="font-bold text-sm">Mini Quiz</span>
                  <span className="text-xs text-muted-foreground">20 Qs</span>
                </Button>
                
                {/* Practice Mode - Pro+ only OR trial users */}
                {(hasFeature('subjectPractice') || isInTrial) ? (
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
                    onClick={handleUpgradeClick}
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
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
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

              {/* Study Materials - Pro+ only OR trial users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                {(hasFeature('studyMaterials') || isInTrial) ? (
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
                  {Math.ceil((new Date('2026-04-01').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
                <p className="text-sm text-muted-foreground mt-2">until UTME 2026</p>
              </motion.div>

              {/* AI Tips Based on Quiz Performance */}
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
      {isInTrial && formattedTime && (
        <TrialTimerBadge formattedTime={formattedTime} isLow={parseInt(formattedTime.split(':')[0]) < 5} />
      )}
      
      <Header onGetStarted={handleGetStarted} hasAccess={effectiveAccess || isInTrial} />
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
            {(effectiveAccess || isInTrial) && (
              <Button
                variant="default"
                size="sm"
                onClick={handleGoToDashboard}
                className="gradient-primary text-primary-foreground"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                {isInTrial ? 'Try Dashboard' : 'Dashboard'}
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
        <HowItWorksSection onStartTrial={handleStartTrial} />
        <PricingSection onSelectPlan={handleSelectPlan} highlightStandard={highlightStandard} />
      </div>
      <Footer />

      {/* Free Trial Banner - only for non-logged-in users who haven't used demo */}
      {!user && !effectiveAccess && !isLoading && (
        <FreeTrialBanner onStartTrial={handleStartTrial} userEmail={userEmail || undefined} />
      )}

      {/* Payment Modal */}
      {selectedPlan && user && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={plans[selectedPlan]}
          onSuccess={handlePaymentSuccess}
          initialEmail={userEmail || undefined}
        />
      )}
    </div>
  );
};

export default Index;

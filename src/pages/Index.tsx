import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
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
import { FreeTrialBanner } from '@/components/FreeTrialBanner';
import { DemoQuizFlow } from '@/components/DemoQuizFlow';
import { TimedQuiz } from '@/components/TimedQuiz';
import { QuizResults } from '@/components/QuizResults';
import { StudyStats } from '@/components/StudyStats';
import { Footer } from '@/components/Footer';
import { BackButton } from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, FileText, Target, Calendar, BookOpen, Zap, LogOut } from 'lucide-react';

type Step = 'landing' | 'subject-select' | 'upload' | 'personalize' | 'processing' | 'dashboard' | 'quiz' | 'quiz-results' | 'demo';

interface FormData {
  targetScore: string;
  hoursPerDay: string;
  weakestSubject: string;
  examDate: string;
}

const plans = {
  basic: { name: 'Basic', price: 7500 },
  standard: { name: 'Standard', price: 12000 },
  premium: { name: 'Premium', price: 30000 },
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [personalizationData, setPersonalizationData] = useState<FormData | null>(null);
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [quizType, setQuizType] = useState<'full' | 'mini'>('full');
  const [quizResults, setQuizResults] = useState<any>(null);
  const [highlightStandard, setHighlightStandard] = useState(false);
  
  const { user, isLoading, hasAccess, isAdmin, isOwner, userRole, signOut, refreshAccess } = useAuth();
  const navigate = useNavigate();

  // Redirect unauthenticated users to login first
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const userEmail = user?.email || null;

  // Effective access check (owner always has access)
  const effectiveAccess = hasAccess || isOwner;

  // Load user subjects (no auto-redirect - users see landing page first)
  useEffect(() => {
    const loadUserSubjects = async () => {
      if (!userEmail || isLoading) return;
      
      const { data } = await supabase
        .from('user_subjects')
        .select('subjects')
        .eq('email', userEmail)
        .single();
      
      if (data?.subjects) {
        setUserSubjects(data.subjects as string[]);
      }
    };
    
    loadUserSubjects();
  }, [userEmail, isLoading]);

  // Check for step param from payment success redirect
  useEffect(() => {
    const step = searchParams.get('step');
    if (step === 'upload' && userEmail) {
      setCurrentStep('subject-select');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, userEmail]);

  const handleGetStarted = () => {
    if (user) {
      // Already logged in
      if (effectiveAccess) {
        // Paid user or owner - go to dashboard
        if (userSubjects.length === 0) {
          setCurrentStep('subject-select');
        } else {
          setCurrentStep('dashboard');
        }
      } else {
        // Unpaid user - scroll to TOP of pricing section and highlight Standard
        setHighlightStandard(true);
        setTimeout(() => {
          const pricingSection = document.getElementById('pricing');
          if (pricingSection) {
            const headerOffset = 80; // Account for fixed header
            const elementPosition = pricingSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      navigate('/auth');
    }
  };

  const handleSeeHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPlan = (plan: string) => {
    const planKey = plan as keyof typeof plans;
    setSelectedPlan(planKey);
    
    // Owner bypasses payment completely - instant access
    if (isOwner) {
      toast.success('Owner access granted! 👑');
      if (userSubjects.length === 0) {
        setCurrentStep('subject-select');
      } else {
        setCurrentStep('dashboard');
      }
      return;
    }
    
    if (user) {
      setIsPaymentModalOpen(true);
    } else {
      navigate('/auth');
    }
  };

  const handlePaymentSuccess = async (reference: string, email: string) => {
    setIsPaymentModalOpen(false);
    await refreshAccess();
    toast.success('Payment successful! 🎉 Let\'s pick your subjects!');
    setCurrentStep('subject-select');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubjectsSelected = (subjects: string[]) => {
    setUserSubjects(subjects);
    setCurrentStep('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadComplete = (files: File[]) => {
    toast.success(`${files.length} file(s) ready for AI magic! ✨`);
    setCurrentStep('personalize');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = (data: unknown) => {
    setPersonalizationData(data as FormData);
    toast.success('Generating your personalized study plan... 🚀');
    setCurrentStep('processing');
    
    setTimeout(() => {
      setCurrentStep('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3000);
  };

  const handleStartQuiz = (type: 'full' | 'mini') => {
    setQuizType(type);
    setCurrentStep('quiz');
  };

  const handleQuizComplete = (results: any) => {
    setQuizResults(results);
    setCurrentStep('quiz-results');
  };

  const handleStartTrial = () => {
    setCurrentStep('demo');
  };

  const handleUpgradeClick = () => {
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
    await signOut();
    setCurrentStep('landing');
    toast.success('Signed out successfully');
  };

  // Quiz step
  if (currentStep === 'quiz' && userEmail && userSubjects.length > 0) {
    return (
      <>
        <BackButton onClick={() => setCurrentStep('dashboard')} />
        <TimedQuiz
          userEmail={userEmail}
          subjects={userSubjects}
          quizType={quizType}
          onComplete={handleQuizComplete}
          onExit={() => setCurrentStep('dashboard')}
        />
      </>
    );
  }

  // Quiz results step
  if (currentStep === 'quiz-results' && quizResults) {
    return (
      <>
        <BackButton onClick={() => setCurrentStep('dashboard')} />
        <QuizResults
          results={quizResults}
          quizType={quizType}
          onRetry={() => setCurrentStep('dashboard')}
          onHome={() => setCurrentStep('dashboard')}
        />
      </>
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

  // Subject selection step (after payment or for owner)
  if (currentStep === 'subject-select' && userEmail) {
    return (
      <>
        <BackButton onClick={() => setCurrentStep('landing')} />
        <SubjectSelector
          userEmail={userEmail}
          onComplete={handleSubjectsSelected}
        />
      </>
    );
  }

  // Protected steps require access
  const isProtectedStep = ['upload', 'personalize', 'processing', 'dashboard', 'quiz', 'quiz-results'].includes(currentStep);

  if (isProtectedStep) {
    return (
      <PaywallGate hasAccess={effectiveAccess} isLoading={isLoading} onUpgrade={handleUpgradeClick}>
        <div className="min-h-screen bg-background">
          <Header onGetStarted={handleGetStarted} hasAccess={effectiveAccess} />
          {/* Back Button */}
          <BackButton onClick={() => setCurrentStep(currentStep === 'dashboard' ? 'landing' : 'dashboard')} />
          <div className="pt-16">
            {/* Admin Badge and Sign Out */}
            {user && (
              <div className="fixed top-20 right-4 z-50 flex items-center gap-2">
                {isAdmin && <AdminBadge role={userRole} linkToAdmin />}
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
            
            {currentStep === 'upload' && (
              <UploadSection onUploadComplete={handleUploadComplete} />
            )}
            
            {currentStep === 'personalize' && (
              <PersonalizationForm onSubmit={handleFormSubmit} />
            )}
            
            {currentStep === 'processing' && (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-20 h-20 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center"
                  >
                    <span className="text-3xl">🚀</span>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Processing Your Materials</h2>
                  <p className="text-muted-foreground">Our AI is analyzing your past questions...</p>
                  <p className="text-sm text-primary mt-2">You're crushing this! 💪</p>
                </div>
              </div>
            )}

            {currentStep === 'dashboard' && userEmail && (
              <div className="py-8 px-4">
                <div className="max-w-6xl mx-auto">
                  {/* Welcome Message */}
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

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                  >
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex flex-col gap-2"
                      onClick={() => handleStartQuiz('full')}
                    >
                      <Play className="w-8 h-8 text-primary" />
                      <span className="font-bold">Full Quiz</span>
                      <span className="text-xs text-muted-foreground">60 questions • 90 min</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex flex-col gap-2"
                      onClick={() => handleStartQuiz('mini')}
                    >
                      <Zap className="w-8 h-8 text-yellow-500" />
                      <span className="font-bold">Mini Quiz</span>
                      <span className="text-xs text-muted-foreground">20 questions • 30 min</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex flex-col gap-2"
                      onClick={() => setCurrentStep('upload')}
                    >
                      <FileText className="w-8 h-8 text-blue-500" />
                      <span className="font-bold">Upload PDF</span>
                      <span className="text-xs text-muted-foreground">AI magic ✨</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex flex-col gap-2"
                      onClick={() => setCurrentStep('personalize')}
                    >
                      <Target className="w-8 h-8 text-green-500" />
                      <span className="font-bold">Study Plan</span>
                      <span className="text-xs text-muted-foreground">Personalized</span>
                    </Button>
                  </motion.div>

                  {/* Subject Tags */}
                  {userSubjects.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-wrap gap-2 justify-center mb-8"
                    >
                      <span className="text-sm text-muted-foreground">Your subjects:</span>
                      {userSubjects.map(subject => (
                        <span
                          key={subject}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize"
                        >
                          {subject.replace('_', ' ')}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  {/* Study Stats */}
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Your Study Stats 📊
                    </h2>
                    <StudyStats userEmail={userEmail} />
                  </div>

                  {/* Premium Dashboard Features */}
                  <PremiumDashboard
                    userEmail={userEmail}
                    isAdmin={isAdmin}
                    adminRole={userRole}
                    targetScore={personalizationData?.targetScore ? parseInt(personalizationData.targetScore) : undefined}
                    weakSubject={personalizationData?.weakestSubject}
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
            )}
          </div>
          {currentStep !== 'dashboard' && <Footer />}
        </div>
      </PaywallGate>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onGetStarted={handleGetStarted} hasAccess={effectiveAccess} />
      <div className="pt-16">
        {/* Admin Badge and Sign Out for logged in users */}
        {user && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2">
            {isAdmin && <AdminBadge role={userRole} linkToAdmin />}
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

      {/* Free Trial Banner - only for non-access users */}
      {!effectiveAccess && !isLoading && (
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

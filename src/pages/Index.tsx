import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { PricingSection } from '@/components/PricingSection';
import { UploadSection } from '@/components/UploadSection';
import { PersonalizationForm } from '@/components/PersonalizationForm';
import { PaymentModal } from '@/components/PaymentModal';
import { EmailPromptModal } from '@/components/EmailPromptModal';
import { PaywallGate } from '@/components/PaywallGate';
import { AdminBadge } from '@/components/AdminBadge';
import { PremiumDashboard } from '@/components/PremiumDashboard';
import { Footer } from '@/components/Footer';
import { useAccessControl } from '@/hooks/useAccessControl';
import { toast } from 'sonner';

type Step = 'landing' | 'upload' | 'personalize' | 'processing' | 'dashboard';

interface FormData {
  targetScore: string;
  hoursPerDay: string;
  weakestSubject: string;
  examDate: string;
}

const plans = {
  basic: { name: 'Basic', price: 7500 },
  pro: { name: 'Pro', price: 12000 },
  ultimate: { name: 'Ultimate', price: 30000 },
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEmailPromptOpen, setIsEmailPromptOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [personalizationData, setPersonalizationData] = useState<FormData | null>(null);
  const { hasAccess, isAdmin, adminRole, isLoading, setUserEmail, userEmail, refreshAccess } = useAccessControl();

  // Check for step param from payment success redirect
  useEffect(() => {
    const step = searchParams.get('step');
    if (step === 'upload') {
      const paymentData = sessionStorage.getItem('jamb_payment');
      if (paymentData) {
        const parsed = JSON.parse(paymentData);
        setUserEmail(parsed.email);
        setCurrentStep('upload');
        setSearchParams({});
      }
    }
  }, [searchParams, setSearchParams, setUserEmail]);

  const handleGetStarted = () => {
    // Show email prompt first
    setIsEmailPromptOpen(true);
  };

  const handleSelectPlan = (plan: string) => {
    const planKey = plan as keyof typeof plans;
    setSelectedPlan(planKey);
    // Show email prompt first before payment
    setIsEmailPromptOpen(true);
  };

  // Owner/paid user bypasses payment
  const handleOwnerAccess = (email: string) => {
    setIsEmailPromptOpen(false);
    setUserEmail(email);
    toast.success('Welcome back! Access granted.');
    setCurrentStep('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Non-owner proceeds to payment
  const handleProceedToPayment = (email: string) => {
    setIsEmailPromptOpen(false);
    setPendingEmail(email);
    
    // If no plan selected yet, scroll to pricing
    if (!selectedPlan) {
      const pricingSection = document.getElementById('pricing');
      pricingSection?.scrollIntoView({ behavior: 'smooth' });
      toast.info('Select a plan to continue');
      return;
    }
    
    // Open payment modal with the email
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (reference: string, email: string) => {
    setIsPaymentModalOpen(false);
    setUserEmail(email);
    toast.success('Payment successful! Redirecting...');
    
    sessionStorage.setItem('jamb_payment', JSON.stringify({
      reference,
      email,
      package: selectedPlan,
    }));
    
    setCurrentStep('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadComplete = (files: File[]) => {
    toast.success(`${files.length} file(s) ready for AI processing`);
    setCurrentStep('personalize');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = (data: unknown) => {
    console.log('Form data:', data);
    setPersonalizationData(data as FormData);
    toast.success('Generating your personalized study plan...');
    setCurrentStep('processing');
    
    // Simulate processing then go to dashboard
    setTimeout(() => {
      setCurrentStep('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3000);
  };

  const handleUpgradeClick = () => {
    setCurrentStep('landing');
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing');
      pricingSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Protected steps require access
  const isProtectedStep = currentStep !== 'landing';

  if (isProtectedStep) {
    return (
      <PaywallGate hasAccess={hasAccess} isLoading={isLoading} onUpgrade={handleUpgradeClick}>
        <div className="min-h-screen bg-background">
          <Header onGetStarted={handleGetStarted} />
          <div className="pt-16">
            {isAdmin && (
              <div className="fixed top-20 right-4 z-50">
                <AdminBadge role={adminRole} linkToAdmin />
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
                  <div className="w-20 h-20 rounded-full gradient-primary animate-pulse mx-auto mb-6 flex items-center justify-center">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Processing Your Materials</h2>
                  <p className="text-muted-foreground">Our AI is analyzing your past questions...</p>
                </div>
              </div>
            )}

            {currentStep === 'dashboard' && userEmail && (
              <PremiumDashboard
                userEmail={userEmail}
                isAdmin={isAdmin}
                adminRole={adminRole}
                targetScore={personalizationData?.targetScore ? parseInt(personalizationData.targetScore) : undefined}
                weakSubject={personalizationData?.weakestSubject}
              />
            )}
          </div>
          {currentStep !== 'dashboard' && <Footer />}
        </div>
      </PaywallGate>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onGetStarted={handleGetStarted} />
      <div className="pt-16">
        {isAdmin && (
          <div className="fixed top-20 right-4 z-50">
            <AdminBadge role={adminRole} linkToAdmin />
          </div>
        )}
        <HeroSection onGetStarted={handleGetStarted} />
        <PricingSection onSelectPlan={handleSelectPlan} />
      </div>
      <Footer />

      {/* Email Prompt Modal - shown FIRST before payment */}
      <EmailPromptModal
        isOpen={isEmailPromptOpen}
        onClose={() => setIsEmailPromptOpen(false)}
        onOwnerAccess={handleOwnerAccess}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* Payment Modal - shown only for non-owners after email check */}
      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={plans[selectedPlan]}
          onSuccess={handlePaymentSuccess}
          initialEmail={pendingEmail || undefined}
        />
      )}
    </div>
  );
};

export default Index;

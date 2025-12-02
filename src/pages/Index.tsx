import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { PricingSection } from '@/components/PricingSection';
import { UploadSection } from '@/components/UploadSection';
import { PersonalizationForm } from '@/components/PersonalizationForm';
import { PaymentModal } from '@/components/PaymentModal';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';

type Step = 'landing' | 'upload' | 'personalize' | 'processing';

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
  const [userEmail, setUserEmail] = useState('');

  // Check for step param from payment success redirect
  useEffect(() => {
    const step = searchParams.get('step');
    if (step === 'upload') {
      const paymentData = sessionStorage.getItem('jamb_payment');
      if (paymentData) {
        const parsed = JSON.parse(paymentData);
        setUserEmail(parsed.email);
        setCurrentStep('upload');
        // Clear the search param
        setSearchParams({});
      }
    }
  }, [searchParams, setSearchParams]);

  const handleGetStarted = () => {
    const pricingSection = document.getElementById('pricing');
    pricingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPlan = (plan: string) => {
    const planKey = plan as keyof typeof plans;
    setSelectedPlan(planKey);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (reference: string, email: string) => {
    setIsPaymentModalOpen(false);
    setUserEmail(email);
    toast.success('Payment successful! Redirecting...');
    
    // Store payment info and navigate to upload
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
    toast.success('Generating your personalized study plan...');
    setCurrentStep('processing');
  };

  if (currentStep === 'upload') {
    return (
      <div className="min-h-screen bg-background">
        <Header onGetStarted={handleGetStarted} />
        <div className="pt-16">
          <UploadSection onUploadComplete={handleUploadComplete} />
        </div>
        <Footer />
      </div>
    );
  }

  if (currentStep === 'personalize') {
    return (
      <div className="min-h-screen bg-background">
        <Header onGetStarted={handleGetStarted} />
        <div className="pt-16">
          <PersonalizationForm onSubmit={handleFormSubmit} />
        </div>
        <Footer />
      </div>
    );
  }

  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full gradient-primary animate-pulse mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Processing Your Materials</h2>
          <p className="text-muted-foreground">Our AI is analyzing your past questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onGetStarted={handleGetStarted} />
      <div className="pt-16">
        <HeroSection onGetStarted={handleGetStarted} />
        <PricingSection onSelectPlan={handleSelectPlan} />
      </div>
      <Footer />

      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={plans[selectedPlan]}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Index;

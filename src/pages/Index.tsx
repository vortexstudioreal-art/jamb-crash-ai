import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { PricingSection } from '@/components/PricingSection';
import { UploadSection } from '@/components/UploadSection';
import { PersonalizationForm } from '@/components/PersonalizationForm';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';

type Step = 'landing' | 'payment' | 'upload' | 'personalize' | 'processing';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handleGetStarted = () => {
    const pricingSection = document.getElementById('pricing');
    pricingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    toast.success(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan selected!`);
    // In production, this would redirect to Paystack
    setCurrentStep('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadComplete = (files: File[]) => {
    toast.success(`${files.length} file(s) ready for AI processing`);
    setCurrentStep('personalize');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = (data: any) => {
    console.log('Form data:', data);
    toast.success('Generating your personalized study plan...');
    setCurrentStep('processing');
    // In production, this would trigger the backend processing
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
    </div>
  );
};

export default Index;

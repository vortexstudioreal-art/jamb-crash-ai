import { motion } from 'framer-motion';
import { PricingCard } from './PricingCard';
import { Shield, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PricingSectionProps {
  onSelectPlan: (plan: string) => void;
  highlightStandard?: boolean;
}

const plans = [
  {
    key: 'basic',
    name: 'Basic',
    price: 5000,
    features: [
      'Full & Mini Quiz modes',
      'Study Materials & Stats',
      '2 PDF uploads/day',
      '5-day Study Plan max',
      '5 AI explanations/day',
      '3 flashcards/day',
    ],
  },
  {
    key: 'pro',
    name: 'ACE',
    price: 10000,
    popular: true,
    features: [
      'Everything in Basic',
      'Practice Quiz (from mistakes)',
      'Unlimited PDF uploads',
      'Full Study Plan (no limits)',
      'Unlimited AI explanations',
      'Unlimited flashcards',
      'Email reminders',
      'AI Study Tips',
      'AI Score Prediction',
    ],
  },
  {
    key: 'premium',
    name: 'SCHOLAR',
    price: 15000,
    features: [
      'Everything in ACE',
      'WhatsApp Reminders',
      'Refer & Earn (₦1,000 bonus)',
      'Advanced AI Prediction',
      'Lifetime access forever',
      'Priority support 24/7',
    ],
  },
];

export const PricingSection = ({ onSelectPlan, highlightStandard }: PricingSectionProps) => {
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (highlightStandard) {
      setIsHighlighted(true);
      // Remove highlight after 3 seconds
      const timer = setTimeout(() => setIsHighlighted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightStandard]);

  return (
    <section id="pricing" className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Success Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Invest in your future. One payment, lifetime access to your personalized study materials.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.key}
              className={`transition-all duration-500 ${
                plan.key === 'pro' && isHighlighted
                  ? 'ring-4 ring-primary ring-offset-4 ring-offset-background animate-pulse rounded-2xl scale-105'
                  : ''
              }`}
            >
              <PricingCard
                {...plan}
                delay={index * 0.1}
                onSelect={() => onSelectPlan(plan.key)}
              />
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span>Powered by Paystack</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 text-primary font-bold">₦</span>
            <span>Naira Only</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

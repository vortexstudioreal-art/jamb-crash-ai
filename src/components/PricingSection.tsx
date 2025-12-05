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
    name: 'Basic',
    price: 7500,
    features: [
      '48-hour crash study plan',
      '3 PDF uploads max',
      'Basic 40-question quiz',
      '30-day access',
      'Email delivery',
    ],
  },
  {
    name: 'Standard',
    price: 12000,
    popular: true,
    features: [
      '72-hour intensive plan',
      'Unlimited PDF uploads',
      'Full 60-question timed quiz',
      'Daily WhatsApp reminders',
      'Predicted score analysis',
      '90-day access',
    ],
  },
  {
    name: 'Premium',
    price: 30000,
    features: [
      'Everything in Standard',
      'Lifetime access forever',
      'Priority support 24/7',
      '₦2,000 referral bonus',
      'Group study access',
      'Personal study advisor',
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
              key={plan.name}
              className={`transition-all duration-500 ${
                plan.name === 'Standard' && isHighlighted
                  ? 'ring-4 ring-primary ring-offset-4 ring-offset-background animate-pulse rounded-2xl scale-105'
                  : ''
              }`}
            >
              <PricingCard
                {...plan}
                delay={index * 0.1}
                onSelect={() => onSelectPlan(plan.name.toLowerCase())}
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

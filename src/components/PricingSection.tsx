import { motion } from 'framer-motion';
import { PricingCard } from './PricingCard';
import { Shield, CreditCard } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: string) => void;
}

const plans = [
  {
    name: 'Basic',
    price: 7500,
    features: [
      'AI question extraction',
      'Personalized timetable',
      '100 hot questions highlighted',
      'PDF study guide',
      'Email delivery',
    ],
  },
  {
    name: 'Pro',
    price: 12000,
    popular: true,
    features: [
      'Everything in Basic',
      '200 hot questions highlighted',
      'Hot-topic summaries',
      '7 days WhatsApp reminders',
      'Priority email support',
    ],
  },
  {
    name: 'Ultimate',
    price: 30000,
    features: [
      'Everything in Pro',
      '300+ hot questions highlighted',
      '30 days WhatsApp reminders',
      'Subject-specific tips',
      'Score prediction analysis',
      'Unlimited question uploads',
    ],
  },
];

export const PricingSection = ({ onSelectPlan }: PricingSectionProps) => {
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
            <PricingCard
              key={plan.name}
              {...plan}
              delay={index * 0.1}
              onSelect={() => onSelectPlan(plan.name.toLowerCase())}
            />
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

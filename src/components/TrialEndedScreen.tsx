import { motion } from 'framer-motion';
import { Clock, Lock, Sparkles, Target, BookOpen, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrialEndedScreenProps {
  onUpgrade: () => void;
}

const packages = [
  {
    name: 'Basic',
    price: '₦5,000',
    duration: '30 days',
    features: [
      '30-question quiz',
      '3 PDF uploads max',
      'Basic study plan',
    ],
    color: 'border-muted-foreground',
    bgColor: 'bg-muted/20',
  },
  {
    name: 'Pro',
    price: '₦10,000',
    duration: '90 days',
    features: [
      '60-question quiz',
      'Unlimited PDF uploads',
      'Full study plan',
      'Practice by Subject & Year',
      'Study materials',
      'WhatsApp reminders',
      'Predicted score',
    ],
    color: 'border-primary',
    bgColor: 'bg-primary/20',
    popular: true,
  },
  {
    name: 'Premium',
    price: '₦15,000',
    duration: 'Lifetime',
    features: [
      'Everything in Pro',
      'Lifetime access',
      'Advanced prediction',
      'Priority support',
    ],
    color: 'border-yellow-500',
    bgColor: 'bg-yellow-500/20',
  },
];

export const TrialEndedScreen = ({ onUpgrade }: TrialEndedScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="max-w-4xl w-full py-8">
        {/* Header */}
        <motion.div
          initial={{ scale: 0.9, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Free Trial Ended ⏰
          </h1>
          <p className="text-muted-foreground text-lg">
            Your 30-minute trial has expired. Upgrade to continue your JAMB preparation!
          </p>
        </motion.div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 border-2 ${pkg.color} ${pkg.bgColor}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular 🔥
                </div>
              )}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
                <p className="text-3xl font-bold text-primary mt-2">{pkg.price}</p>
                <p className="text-sm text-muted-foreground">{pkg.duration}</p>
              </div>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={onUpgrade}
                variant={pkg.popular ? 'hero' : 'outline'}
                className="w-full"
              >
                Get {pkg.name}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-muted-foreground">
            💡 Over 10,000 students have used Jamb Crash AI to prepare for their exams!
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

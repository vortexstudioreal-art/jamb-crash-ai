import { motion } from 'framer-motion';
import { Clock, Flame, Star, Zap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TrialExpiredScreenProps {
  onUpgrade: (plan: string) => void;
}

const packages = [
  {
    name: 'Basic',
    price: '₦5,000',
    period: '1 month',
    features: ['60-question quizzes', 'Study materials & stats', 'Basic study plan'],
    color: 'border-border',
  },
  {
    name: 'Pro',
    price: '₦10,000',
    period: '3 months',
    features: ['Everything in Basic', 'Practice quiz + AI tips', 'Predicted JAMB score', 'Email reminders'],
    color: 'border-primary',
    popular: true,
  },
  {
    name: 'Premium',
    price: '₦15,000',
    period: 'Lifetime',
    features: ['Everything in Pro', 'WhatsApp daily reminders', 'Refer & earn bonus', 'Advanced predictions'],
    color: 'border-yellow-500',
  },
];

export const TrialExpiredScreen = ({ onUpgrade }: TrialExpiredScreenProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force page refresh to clear all state before navigating
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to sign out. Please try again.');
      // Still try to refresh on error
      window.location.href = '/';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="max-w-4xl w-full py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block text-6xl mb-4"
          >
            ⏰
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Time's Up! 
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Your 30-minute free trial has ended
          </p>
          <p className="text-lg text-primary font-semibold flex items-center justify-center gap-2">
            <Flame className="w-5 h-5" />
            Upgrade now to continue your 300+ journey!
            <Flame className="w-5 h-5" />
          </p>
        </motion.div>

        {/* Package Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative bg-card rounded-2xl p-6 border-2 ${pkg.color} ${
                pkg.popular ? 'shadow-lg shadow-primary/20' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Star className="w-4 h-4" /> Most Popular
                </div>
              )}
              <div className="text-center mb-4 pt-2">
                <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
                <div className="text-3xl font-bold text-primary mt-2">{pkg.price}</div>
                {pkg.period && <p className="text-sm text-muted-foreground">{pkg.period}</p>}
              </div>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => onUpgrade(pkg.name.toLowerCase())}
                className={`w-full ${pkg.popular ? 'gradient-primary' : ''}`}
                variant={pkg.popular ? 'default' : 'outline'}
              >
                Get {pkg.name}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Urgency Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center bg-gradient-to-r from-primary/20 to-green-500/20 rounded-2xl p-6 border border-primary/30"
        >
          <p className="text-lg font-medium text-foreground mb-2">
            🎓 Don't let your JAMB dreams slip away!
          </p>
          <p className="text-muted-foreground">
            Thousands of students are already crushing it with Jamb Crash AI.
            Join them today and secure your 300+ score!
          </p>
        </motion.div>

        {/* Sign Out Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
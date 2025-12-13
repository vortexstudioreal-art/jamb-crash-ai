import { motion } from 'framer-motion';
import { Clock, Crown, Zap, BookOpen, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TrialUpgradeScreenProps {
  onUpgrade: () => void;
}

const packages = [
  {
    name: 'Basic',
    price: 5000,
    duration: '30 days',
    features: ['30-question quizzes', 'Basic study plan', '3 PDFs max'],
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/30',
  },
  {
    name: 'Pro',
    price: 10000,
    duration: '90 days',
    features: ['60-question quizzes', 'Unlimited PDFs', 'WhatsApp reminders', 'Score prediction'],
    color: 'from-primary/20 to-green-500/20',
    borderColor: 'border-primary/50',
    popular: true,
  },
  {
    name: 'Premium',
    price: 15000,
    duration: 'Lifetime',
    features: ['All Pro features', 'Lifetime access', 'Priority support', 'Advanced analytics'],
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-500/30',
  },
];

export const TrialUpgradeScreen = ({ onUpgrade }: TrialUpgradeScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full mb-4"
          >
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Trial Ended</span>
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Your Free Trial Has Expired
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Upgrade now to continue your JAMB preparation journey with full access to all features!
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className={`relative overflow-hidden bg-gradient-to-br ${pkg.color} ${pkg.borderColor} border-2 ${
                pkg.popular ? 'ring-2 ring-primary' : ''
              }`}>
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {pkg.name === 'Premium' ? (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    ) : pkg.name === 'Pro' ? (
                      <Zap className="w-5 h-5 text-primary" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-blue-500" />
                    )}
                    <h3 className="font-bold text-lg text-foreground">{pkg.name}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">₦{pkg.price.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-1">/ {pkg.duration}</span>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={onUpgrade}
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    Choose {pkg.name}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Motivation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Your progress and quiz history are saved. Pick up where you left off!</span>
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

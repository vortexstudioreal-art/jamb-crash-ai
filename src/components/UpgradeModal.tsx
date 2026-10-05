import { Lock, Crown, Zap, Star,  Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan: 'basic' | 'pro' | 'premium';
  onUpgrade: (plan: string) => void;
  currentUsage?: { used: number; limit: number };
}

const PLAN_DETAILS = {
  basic: {
    name: 'Basic',
    price: '₦5,000',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  pro: {
    name: 'ACE',
    price: '₦10,000',
    icon: Crown,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  premium: {
    name: 'SCHOLAR',
    price: '₦15,000',
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
};

const PLAN_FEATURES = {
  basic: [
    'Full Quiz & Mini Quiz',
    'Study Materials & Stats',
    '2 PDF uploads/day',
    '5-day Study Plan',
    '5 AI explanations/day',
    '3 flashcards/day',
  ],
  pro: [
    'Everything in Basic',
    'Practice Quiz (from mistakes)',
    'Unlimited PDF uploads',
    'Full Study Plan (no limits)',
    'Unlimited AI explanations',
    'Unlimited flashcards',
    'Email reminders',
    'AI Study Tips',
  ],
  premium: [
    'Everything in ACE',
    'WhatsApp Reminders',
    'Refer & Boost system',
    'Advanced AI Prediction',
    'Priority support',
  ],
};

export const UpgradeModal = ({
  isOpen,
  onClose,
  feature,
  requiredPlan,
  onUpgrade,
  currentUsage,
}: UpgradeModalProps) => {
  const planDetails = PLAN_DETAILS[requiredPlan];
  const Icon = planDetails.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${planDetails.bgColor}`}>
              <Lock className={`w-5 h-5 ${planDetails.color}`} />
            </div>
            Feature Locked
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Feature info */}
          <div className={`p-4 rounded-xl ${planDetails.bgColor} ${planDetails.borderColor} border`}>
            <p className="text-foreground font-medium mb-2">
              {feature} requires {planDetails.name} plan
            </p>
            {currentUsage && currentUsage.limit > 0 && (
              <p className="text-sm text-muted-foreground">
                You've used {currentUsage.used}/{currentUsage.limit} for today
              </p>
            )}
          </div>

          {/* Plan features */}
          <div className="space-y-2">
            <h4 className={`font-semibold ${planDetails.color} flex items-center gap-2`}>
              <Icon className="w-4 h-4" />
              {planDetails.name} Plan - {planDetails.price}
            </h4>
            <ul className="space-y-1.5">
              {PLAN_FEATURES[requiredPlan].map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1 gradient-primary text-primary-foreground"
              onClick={() => onUpgrade(requiredPlan)}
            >
              <Icon className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
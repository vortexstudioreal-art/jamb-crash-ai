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
    price: '₦1,500',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  pro: {
    name: 'ACE',
    price: '₦3,500',
    icon: Crown,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  premium: {
    name: 'SCHOLAR',
    price: '₦7,500',
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
  const requiredDetails = PLAN_DETAILS[requiredPlan];
  const planOrder: Array<'basic' | 'pro' | 'premium'> = ['basic', 'pro', 'premium'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${requiredDetails.bgColor}`}>
              <Lock className={`w-5 h-5 ${requiredDetails.color}`} />
            </div>
            Feature Locked
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Feature info */}
          <div className={`p-4 rounded-xl ${requiredDetails.bgColor} ${requiredDetails.borderColor} border`}>
            <p className="text-foreground font-medium mb-2">
              {feature} requires {requiredDetails.name} plan or higher
            </p>
            {currentUsage && currentUsage.limit > 0 && (
              <p className="text-sm text-muted-foreground">
                You've used {currentUsage.used}/{currentUsage.limit} for today
              </p>
            )}
          </div>

          {/* All three plans — required one highlighted */}
          <div className="space-y-2">
            {planOrder.map((key) => {
              const details = PLAN_DETAILS[key];
              const Icon = details.icon;
              const isRequired = key === requiredPlan;
              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    isRequired
                      ? `${details.bgColor} ${details.borderColor}`
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className={`font-semibold ${details.color} flex items-center gap-2`}>
                      <Icon className="w-4 h-4" />
                      {details.name} — {details.price}
                    </h4>
                    {isRequired && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                        Unlocks this
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1 mb-3">
                    {PLAN_FEATURES[key].slice(0, 4).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isRequired ? 'default' : 'outline'}
                    className={`w-full ${isRequired ? 'gradient-primary text-primary-foreground' : ''}`}
                    onClick={() => onUpgrade(key)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    Choose {details.name}
                  </Button>
                </div>
              );
            })}
          </div>

          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
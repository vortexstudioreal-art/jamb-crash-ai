import { useState } from 'react';
import { motion } from 'framer-motion';
import { WhatsAppReminder } from './WhatsAppReminder';
import { ScorePredictor } from './ScorePredictor';
import { ShareableResultCard } from './ShareableResultCard';
import { ReferralSystem } from './ReferralSystem';
import { FeatureGate } from './FeatureGate';
import { Sparkles, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumDashboardProps {
  userEmail: string;
  isAdmin: boolean;
  adminRole?: 'owner' | 'admin' | 'collaborator' | null;
  targetScore?: number;
  weakSubject?: string;
  onUpgrade?: () => void;
}

export const PremiumDashboard = ({ userEmail, isAdmin, adminRole, targetScore, weakSubject, onUpgrade }: PremiumDashboardProps) => {
  const [showResultCard, setShowResultCard] = useState(false);
  const [predictedScores, setPredictedScores] = useState<{ min: number; max: number } | null>(null);
  const { userPackage } = useAuth();

  const handleShowResultCard = (min: number, max: number) => {
    setPredictedScores({ min, max });
    setShowResultCard(true);
  };

  // Get package display name
  const packageName = userPackage === 'admin' ? 'Premium' : 
                      userPackage ? userPackage.charAt(0).toUpperCase() + userPackage.slice(1) : 
                      'Free';

  return (
    <div className="mt-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Premium Features ✨
            </h2>
            <p className="text-sm text-muted-foreground">
              Unlock your full potential with these tools
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{packageName} Plan</span>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* WhatsApp Reminders - Pro+ */}
        <FeatureGate feature="whatsAppReminders" onUpgrade={onUpgrade}>
          <WhatsAppReminder userEmail={userEmail} />
        </FeatureGate>

        {/* Score Predictor - Pro+ */}
        <FeatureGate feature="aiScorePrediction" onUpgrade={onUpgrade}>
          <ScorePredictor
            userEmail={userEmail}
            targetScore={targetScore}
            weakSubject={weakSubject}
            onShowResultCard={handleShowResultCard}
          />
        </FeatureGate>

        {/* Referral System - Premium only */}
        <div className="md:col-span-2">
          <FeatureGate feature="referralBonus" onUpgrade={onUpgrade}>
            <ReferralSystem userEmail={userEmail} />
          </FeatureGate>
        </div>
      </div>

      {/* Shareable Result Card Modal */}
      {showResultCard && predictedScores && (
        <ShareableResultCard
          predictedMin={predictedScores.min}
          predictedMax={predictedScores.max}
          onClose={() => setShowResultCard(false)}
        />
      )}
    </div>
  );
};

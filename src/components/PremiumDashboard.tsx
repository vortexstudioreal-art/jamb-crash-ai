import { useState } from 'react';
import { motion } from 'framer-motion';
import { WhatsAppReminder } from './WhatsAppReminder';
import { ScorePredictor } from './ScorePredictor';
import { ShareableResultCard } from './ShareableResultCard';
import { ReferralSystem } from './ReferralSystem';
import { Sparkles } from 'lucide-react';

interface PremiumDashboardProps {
  userEmail: string;
  isAdmin: boolean;
  adminRole?: 'owner' | 'admin' | 'collaborator' | null;
  targetScore?: number;
  weakSubject?: string;
}

export const PremiumDashboard = ({ userEmail, isAdmin, adminRole, targetScore, weakSubject }: PremiumDashboardProps) => {
  const [showResultCard, setShowResultCard] = useState(false);
  const [predictedScores, setPredictedScores] = useState<{ min: number; max: number } | null>(null);

  const handleShowResultCard = (min: number, max: number) => {
    setPredictedScores({ min, max });
    setShowResultCard(true);
  };

  return (
    <div className="mt-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Premium Features ✨
        </h2>
        <p className="text-sm text-muted-foreground">
          Unlock your full potential with these tools
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* WhatsApp Reminders */}
        <WhatsAppReminder userEmail={userEmail} />

        {/* Score Predictor */}
        <ScorePredictor
          userEmail={userEmail}
          targetScore={targetScore}
          weakSubject={weakSubject}
          onShowResultCard={handleShowResultCard}
        />

        {/* Referral System */}
        <div className="md:col-span-2">
          <ReferralSystem userEmail={userEmail} />
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

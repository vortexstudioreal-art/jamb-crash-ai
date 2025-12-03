import { useState } from 'react';
import { motion } from 'framer-motion';
import { WhatsAppReminder } from './WhatsAppReminder';
import { ScorePredictor } from './ScorePredictor';
import { ShareableResultCard } from './ShareableResultCard';
import { ReferralSystem } from './ReferralSystem';
import { AdminBadge } from './AdminBadge';

interface PremiumDashboardProps {
  userEmail: string;
  isAdmin: boolean;
  adminRole?: 'owner' | 'collaborator' | null;
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Your Study Dashboard</h1>
            {isAdmin && <AdminBadge role={adminRole} />}
          </div>
          <p className="text-muted-foreground">
            Access all your premium features below
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
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
    </div>
  );
};

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Sparkles } from 'lucide-react';
import { PremiumDashboard } from '@/components/PremiumDashboard';
import { TopicMasteryTracker } from '@/components/TopicMasteryTracker';
import type { DashboardContext } from '@/types/dashboard';

interface AiTabProps extends DashboardContext {
  handleUpgradeClick: (plan?: string) => void;
  onOpenLesson?: (subject: string, topic?: string) => void;
}

export const AiTab = ({
  userEmail,
  effectiveAdmin,
  userRole,
  effectiveSubjects,
  personalizationData,
  weakSubjectFromQuiz,
  handleUpgradeClick,
  setPracticeSubjectOverride,
  setQuizType,
  navigateStep,
  onOpenLesson,
}: AiTabProps) => {
  return (
    <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* AI Header */}
      <div>
        <p className="text-muted-foreground text-sm">Your smart study partner</p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2">
          AI Assistant <Brain className="w-6 h-6 text-primary" />
        </h1>
      </div>

      <div className="rounded-2xl p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Study Assistant</h2>
            <p className="text-xs text-muted-foreground">Ask anything about JAMB, get instant help</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Tap the sparkle button (bottom-right) to open the AI chat and ask any JAMB question.
        </p>
      </div>

      {/* Score Prediction + weakness + AI features */}
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <PremiumDashboard
          userEmail={userEmail}
          isAdmin={effectiveAdmin}
          adminRole={(userRole as 'owner' | 'admin' | 'collaborator' | null) ?? null}
          targetScore={personalizationData?.targetScore ? parseInt(personalizationData.targetScore) : undefined}
          weakSubject={weakSubjectFromQuiz || personalizationData?.weakestSubject}
          onUpgrade={handleUpgradeClick}
        />
      </Suspense>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Weakness & Topic Analysis</h2>
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
          <TopicMasteryTracker 
            userEmail={userEmail} 
            allowedSubjects={effectiveSubjects}
            onStartPracticeTopic={(subject, _topic) => {
              if (subject && subject !== 'all') {
                setPracticeSubjectOverride(subject);
                setQuizType('subject');
              } else {
                setPracticeSubjectOverride(null);
                setQuizType('mini');
              }
            }}
            onGoToLesson={(subject, topic) => {
              if (onOpenLesson) {
                onOpenLesson(subject, topic);
              } else {
                navigateStep('lessons');
              }
            }}
          />
        </Suspense>
      </div>

      {weakSubjectFromQuiz && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
          <p className="text-sm text-foreground">
            👋 <span className="font-semibold">AI Recommendation:</span> Focus on{' '}
            <span className="font-bold text-primary capitalize">{weakSubjectFromQuiz.replace('_', ' ')}</span>. Try 20 extra questions today.
          </p>
        </div>
      )}
    </motion.div>
  );
};

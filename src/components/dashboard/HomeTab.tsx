import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Zap, BookOpen, Target, Trophy, Lock, Award } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { HomeSummary } from '@/components/HomeSummary';
import { StudyPlanTodayCard } from '@/components/StudyPlanTodayCard';
import { RenewalNudge } from '@/components/RenewalNudge';
import { GoogleAdSense } from '@/components/GoogleAdSense';
import type { DashboardContext } from '@/types/dashboard';

interface HomeTabProps extends DashboardContext {
  handleOpenStudyCalendar: () => void;
  handleGenerateStudyPlan: () => void;
  handleStartQuiz: (type: 'full' | 'mini' | 'subject' | 'timed-practice') => void;
}

export const HomeTab = ({
  userEmail,
  user,
  effectiveAdmin,
  effectiveAccess,
  isTrialActive,
  effectiveSubjects,
  handleUpgradeClick,
  handleOpenStudyCalendar,
  handleGenerateStudyPlan,
  handleStartQuiz,
  handleTabChange,
  weakSubjectFromQuiz,
  hasFeature,
}: HomeTabProps) => {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-base">Good Morning,</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
          {(user?.user_metadata?.full_name?.split(' ')[0]) || 'Champion'} 👋
        </h1>
      </div>

      {/* Renewal nudge */}
      <RenewalNudge
        userEmail={userEmail}
        isAdmin={effectiveAdmin}
        hasAccess={effectiveAccess}
        onUpgrade={handleUpgradeClick}
      />

      {/* Predicted Score + Streak + Goal */}
      <Suspense fallback={<Skeleton className="h-24 w-full rounded-xl" />}>
        <HomeSummary userEmail={userEmail} />
      </Suspense>

      {/* Study plan follow-up */}
      <StudyPlanTodayCard
        userEmail={userEmail}
        onOpenCalendar={handleOpenStudyCalendar}
        onGenerate={handleGenerateStudyPlan}
      />

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
        <button
          onClick={() => handleTabChange('study')}
          className="text-sm font-medium text-primary hover:opacity-80"
        >
          See all
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {(hasFeature('fullQuiz') || isTrialActive) ? (
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-primary hover:bg-primary/5" onClick={() => handleStartQuiz('full')}>
            <Play className="w-5 h-5 text-primary" />
            <span className="font-bold text-xs">Full Quiz</span>
            <span className="text-[10px] text-muted-foreground">60 Qs</span>
          </Button>
        ) : (
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 opacity-60 relative" onClick={() => handleUpgradeClick()}>
            <Lock className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />
            <Play className="w-5 h-5 text-muted-foreground" />
            <span className="font-bold text-xs">Full Quiz</span>
            <span className="text-[10px] text-primary">ACE</span>
          </Button>
        )}
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-yellow-500 hover:bg-yellow-500/5" onClick={() => handleStartQuiz('mini')}>
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-xs">Mini Quiz</span>
          <span className="text-[10px] text-muted-foreground">20 Qs</span>
        </Button>
        {(hasFeature('practiceQuiz') || isTrialActive) ? (
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-purple-500 hover:bg-purple-500/5" onClick={() => handleStartQuiz('subject')}>
            <BookOpen className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-xs">Practice</span>
            <span className="text-[10px] text-muted-foreground">Subject</span>
          </Button>
        ) : (
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 opacity-60 relative" onClick={() => handleUpgradeClick()}>
            <Lock className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            <span className="font-bold text-xs">Practice</span>
            <span className="text-[10px] text-primary">ACE</span>
          </Button>
        )}
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-primary hover:bg-primary/5" onClick={() => handleTabChange('ai')}>
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold text-xs">Ask AI</span>
          <span className="text-[10px] text-muted-foreground">Get Help</span>
        </Button>
      </div>

      {/* Motivational card */}
      <div className="rounded-2xl p-5 border border-primary/30 bg-gradient-to-r from-primary/15 to-primary/5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Award className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-primary">You're doing great!</h3>
          <p className="text-sm text-muted-foreground">Stay consistent and crush your target score.</p>
        </div>
        <Target className="w-10 h-10 text-primary/70 shrink-0" />
      </div>

      {/* AdSense */}
      <GoogleAdSense className="my-4" />
    </motion.div>
  );
};

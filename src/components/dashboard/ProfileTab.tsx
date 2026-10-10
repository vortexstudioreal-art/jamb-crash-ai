import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings as SettingsIcon, Bell, Crown, LogOut } from 'lucide-react';
import { StudyStats } from '@/components/StudyStats';
import type { DashboardContext } from '@/types/dashboard';

interface ProfileTabProps extends DashboardContext {
  handleUpgradeClick: (plan?: string) => void;
}

export const ProfileTab = ({
  userEmail,
  effectiveAccess,
  effectiveAdmin,
  effectiveSubjects,
  handleUpgradeClick,
  handleTabChange,
  handleSignOut,
  navigate,
  navigateStep,
  setPracticeSubjectOverride,
  setQuizType,
}: ProfileTabProps) => {
  return (
    <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-2xl p-5 border border-border bg-card">
        <p className="text-xs text-muted-foreground">Signed in as</p>
        <p className="font-semibold text-foreground truncate">{userEmail}</p>
      </div>

      <h2 className="text-lg font-bold text-foreground">Your Study Stats 👋</h2>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <StudyStats
          userEmail={userEmail}
          allowedSubjects={effectiveSubjects}
          onPracticeSubject={(subject) => {
            if (!effectiveSubjects.includes(subject)) return;
            setPracticeSubjectOverride(subject);
            setQuizType('mini');
            navigateStep('quiz');
          }}
        />
      </Suspense>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1" onClick={() => navigate('/settings')}>
          <SettingsIcon className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm">Settings</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1" onClick={() => handleTabChange('home')}>
          <Bell className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm">Notifications</span>
        </Button>
        {!effectiveAccess && !effectiveAdmin && (
          <Button className="h-auto py-4 flex flex-col gap-1 col-span-2 gradient-primary text-primary-foreground" onClick={() => handleUpgradeClick()}>
            <Crown className="w-5 h-5" />
            <span className="font-bold text-sm">Upgrade to SCHOLAR</span>
          </Button>
        )}
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 col-span-2 text-destructive hover:text-destructive" onClick={handleSignOut}>
          <LogOut className="w-5 h-5" />
          <span className="font-bold text-sm">Sign Out</span>
        </Button>
      </div>
    </motion.div>
  );
};

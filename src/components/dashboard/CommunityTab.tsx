import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, Trophy, GraduationCap, Newspaper, Gamepad2, MessageCircle, Youtube, Flame } from 'lucide-react';
import { LiveCounter } from '@/components/LiveCounter';
import { ReferralSystem } from '@/components/ReferralSystem';
import { StudyBoard } from '@/components/StudyBoard';
import type { DashboardContext } from '@/types/dashboard';

interface CommunityTabProps extends DashboardContext {
  navigate: (path: string) => void;
}

export const CommunityTab = ({
  userEmail,
  effectiveAdmin,
  effectiveSubjects,
  navigateStep,
  navigate,
}: CommunityTabProps) => {
  return (
    <motion.div key="community" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Community Header */}
      <div className="rounded-2xl p-5 border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">The Community 👋</h1>
            <p className="text-xs text-muted-foreground">Learn, compete and grow together</p>
          </div>
        </div>
        <div className="mt-3">
          <LiveCounter />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button variant="outline" className="h-auto py-5 flex flex-col gap-1 hover:border-yellow-500 hover:bg-yellow-500/5" onClick={() => navigateStep('leaderboard' as never)}>
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span className="font-bold text-sm">Leaderboard</span>
        </Button>
        <Button variant="outline" className="h-auto py-5 flex flex-col gap-1 hover:border-primary hover:bg-primary/5" onClick={() => navigate('/games')}>
          <Gamepad2 className="w-6 h-6 text-primary" />
          <span className="font-bold text-sm">Challenges</span>
        </Button>
        <Button variant="outline" className="h-auto py-5 flex flex-col gap-1 hover:border-cyan-500 hover:bg-cyan-500/5" onClick={() => navigateStep('news' as never)}>
          <Newspaper className="w-6 h-6 text-cyan-500" />
          <span className="font-bold text-sm">JAMB News</span>
        </Button>
        <Button variant="outline" className="h-auto py-5 flex flex-col gap-1 hover:border-amber-500 hover:bg-amber-500/5" onClick={() => navigateStep('scholarships' as never)}>
          <GraduationCap className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-sm">Scholarships</span>
        </Button>
      </div>

      {/* Anonymous study board — the heart of the tab */}
      {userEmail && (
        <Suspense fallback={null}>
          <StudyBoard userEmail={userEmail} isAdmin={effectiveAdmin} subjects={effectiveSubjects} />
        </Suspense>
      )}

      <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
        <div className="flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-500" />
          <div>
            <h3 className="font-bold text-foreground">Daily Streak Challenge</h3>
            <p className="text-xs text-muted-foreground">Keep your streak alive — practice daily for bonus rewards.</p>
          </div>
        </div>
      </div>

      {/* Refer & Boost */}
      {userEmail && (
        <Suspense fallback={null}>
          <ReferralSystem userEmail={userEmail} />
        </Suspense>
      )}

      {/* Follow us elsewhere */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="ghost" className="h-auto py-3 flex items-center justify-center gap-2 text-muted-foreground" onClick={() => window.open('https://whatsapp.com/channel/0029VbAqCkeGehEHAIYD1s2y', '_blank')}>
          <MessageCircle className="w-4 h-4 text-green-500" />
          <span className="text-xs font-medium">WhatsApp Channel</span>
        </Button>
        <Button variant="ghost" className="h-auto py-3 flex items-center justify-center gap-2 text-muted-foreground" onClick={() => window.open('https://www.tiktok.com/@jambcrashai', '_blank')}>
          <Youtube className="w-4 h-4 text-pink-500" />
          <span className="text-xs font-medium">TikTok</span>
        </Button>
      </div>
    </motion.div>
  );
};

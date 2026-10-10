import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Layers, StickyNote, FileText, BookOpen, Library, Flame, GraduationCap, Trophy, RefreshCw } from 'lucide-react';
import { OfflineReadyCard } from '@/components/OfflineReadyCard';
import { GoogleAdSense } from '@/components/GoogleAdSense';
import { FeatureGate } from '@/components/FeatureGate';
import { StudyMaterials } from '@/components/StudyMaterials';
import { CourseTipsCard } from '@/components/CourseTipsCard';
import type { DashboardContext } from '@/types/dashboard';

interface StudyTabProps extends DashboardContext {
  handleGenerateStudyPlan: () => void;
  handleUpgradeClick: (plan?: string) => void;
}

export const StudyTab = ({
  userEmail,
  effectiveSubjects,
  weakSubjectFromQuiz,
  hasFeature,
  isTrialActive,
  handleGenerateStudyPlan,
  handleUpgradeClick,
  navigateStep,
  navigate,
  setPracticeSubjectOverride,
  setQuizType,
  setShowSubjectChanger,
}: StudyTabProps) => {
  const requireAccess = (step: string) => {
    navigateStep(step as never);
  };

  return (
    <motion.div key="study" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Study Header */}
      <div>
        <p className="text-muted-foreground text-sm">Let's learn something new</p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Your Study Hub 👋</h1>
      </div>

      <Suspense fallback={null}>
        <OfflineReadyCard userEmail={userEmail} subjects={effectiveSubjects} />
      </Suspense>

      {/* Next Best Action */}
      {weakSubjectFromQuiz && (
        <div className="rounded-2xl p-4 border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground">Your Next Best Action</p>
                <span className="text-[10px] uppercase tracking-wide bg-primary/20 px-2 py-0.5 rounded-full text-primary">
                  Personalized
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Focus on <span className="capitalize font-semibold text-foreground">{weakSubjectFromQuiz.replace('_', ' ')}</span> — practice 20 questions today to strengthen it.
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => {
                  setPracticeSubjectOverride(weakSubjectFromQuiz);
                  setQuizType('mini');
                  navigateStep('quiz');
                }}
              >
                Practice now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Subject tags */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Your subjects:</span>
        {effectiveSubjects.map(subject => (
          <span key={subject} className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
            {subject.replace('_', ' ')}
          </span>
        ))}
        <Button variant="ghost" size="sm" onClick={() => setShowSubjectChanger(true)} className="text-muted-foreground hover:text-primary h-7 px-2">
          <RefreshCw className="w-3 h-3 mr-1" />Change
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-green-500 hover:bg-green-500/5" onClick={handleGenerateStudyPlan}>
          <Target className="w-6 h-6 text-green-500" />
          <span className="font-bold text-sm">Study Plan</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-orange-500 hover:bg-orange-500/5" onClick={() => requireAccess('flashcards')}>
          <Layers className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-sm">Flashcards</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-teal-500 hover:bg-teal-500/5" onClick={() => requireAccess('notes')}>
          <StickyNote className="w-6 h-6 text-teal-500" />
          <span className="font-bold text-sm">Notes</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-blue-500 hover:bg-blue-500/5" onClick={() => requireAccess('upload')}>
          <FileText className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-sm">Upload PDF</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-purple-500 hover:bg-purple-500/5" onClick={() => navigateStep('syllabus')}>
          <BookOpen className="w-6 h-6 text-purple-500" />
          <span className="font-bold text-sm">Syllabus</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-indigo-500 hover:bg-indigo-500/5" onClick={() => navigateStep('lessons')}>
          <GraduationCap className="w-6 h-6 text-indigo-500" />
          <span className="font-bold text-sm">Lessons</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-rose-500 hover:bg-rose-500/5" onClick={() => navigateStep('novels')}>
          <Library className="w-6 h-6 text-rose-500" />
           <span className="font-bold text-sm">Library</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-orange-500 hover:bg-orange-500/5" onClick={() => navigate('/repeated-questions')}>
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-sm">High-Yield Qs</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-1 hover:border-amber-500 hover:bg-amber-500/5" onClick={() => navigateStep('mock')}>
          <Trophy className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-sm">Mock CBT</span>
        </Button>
      </div>

      {(hasFeature('studyMaterials') || isTrialActive) ? (
        <StudyMaterials subjects={effectiveSubjects} />
      ) : (
        <FeatureGate feature="studyMaterials" onUpgrade={handleUpgradeClick}>
          <StudyMaterials subjects={effectiveSubjects} />
        </FeatureGate>
      )}

      {/* AdSense */}
      <GoogleAdSense className="my-4" />

      {/* AI Tip */}
      <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
        <CourseTipsCard userEmail={userEmail} userSubjects={effectiveSubjects} />
      </Suspense>
    </motion.div>
  );
};

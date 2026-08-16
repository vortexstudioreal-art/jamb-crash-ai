import type { DashboardTab } from '@/components/BottomNav';

export type Step = 'loading' | 'landing' | 'subject-select' | 'upload' | 'personalize' | 'processing' | 'dashboard' | 'quiz' | 'quiz-results' | 'mock' | 'study-plan' | 'study-plan-tracker' | 'study-materials' | 'syllabus' | 'flashcards' | 'course-requirements' | 'novels' | 'novel-detail' | 'novel-reader' | 'news' | 'scholarships' | 'leaderboard' | 'notes' | 'speed-round' | 'streak';

export type QuizType = 'full' | 'mini' | 'subject' | 'timed-practice';

export interface DashboardContext {
  userEmail: string;
  user: { user_metadata?: { full_name?: string }; email?: string } | null;
  effectiveAdmin: boolean;
  effectiveOwner: boolean;
  effectiveAccess: boolean;
  effectiveSubjects: string[];
  userRole: string | null;
  isTrialActive: boolean;
  formattedTime: string | null;
  weakSubjectFromQuiz: string | null;
  personalizationData: { targetScore?: string; weakestSubject?: string; hoursPerDay?: string; examDate?: string } | null;
  hasFeature: (feature: string) => boolean;
  navigateStep: (step: Step) => void;
  navigate: (path: string) => void;
  handleUpgradeClick: (plan?: string) => void;
  handleSignOut: () => void;
  handleTabChange: (tab: DashboardTab) => void;
  setPracticeSubjectOverride: (subject: string | null) => void;
  setQuizType: (type: QuizType) => void;
  setSyllabusTargetSubject: (subject: string | null) => void;
  setSyllabusTargetTopic: (topic: string | null) => void;
  setFlashcardsTargetSubject: (subject: string | null) => void;
  setShowSubjectChanger: (show: boolean) => void;
}

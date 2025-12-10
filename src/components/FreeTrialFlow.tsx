import { useState, useEffect } from 'react';
import { FreeTrialSubjectPicker } from './FreeTrialSubjectPicker';
import { TrialQuiz, TrialQuizResults } from './TrialQuiz';
import { TrialScoreScreen } from './TrialScoreScreen';
import { TrialDashboard } from './TrialDashboard';
import { TrialEndedScreen } from './TrialEndedScreen';
import { TrialQuestionReview } from './TrialQuestionReview';

type TrialStep = 'subject-picker' | 'quiz' | 'score' | 'dashboard' | 'review' | 'expired';

interface FreeTrialFlowProps {
  userEmail: string;
  timeRemaining: number | null;
  isTrialExpired: boolean;
  isInTrial: boolean;
  hasTrialStarted: boolean;
  hasCompletedQuiz: boolean;
  trialSubjects: string[] | null;
  trialResults: TrialQuizResults | null;
  onUpgrade: () => void;
  onCancel: () => void;
  onSaveSubjects: (subjects: string[]) => void;
  onSaveResults: (results: TrialQuizResults) => void;
  onStartTrialTimer: () => void;
}

export const FreeTrialFlow = ({
  userEmail,
  timeRemaining,
  isTrialExpired,
  isInTrial,
  hasTrialStarted,
  hasCompletedQuiz,
  trialSubjects,
  trialResults,
  onUpgrade,
  onCancel,
  onSaveSubjects,
  onSaveResults,
  onStartTrialTimer,
}: FreeTrialFlowProps) => {
  // Determine initial step based on state
  const getInitialStep = (): TrialStep => {
    if (isTrialExpired) return 'expired';
    if (hasTrialStarted && hasCompletedQuiz && trialResults) return 'dashboard';
    if (trialSubjects && !hasCompletedQuiz) return 'quiz';
    return 'subject-picker';
  };

  const [currentStep, setCurrentStep] = useState<TrialStep>(getInitialStep);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(trialSubjects || []);
  const [quizResults, setQuizResults] = useState<TrialQuizResults | null>(trialResults);

  // Update step when trial expires
  useEffect(() => {
    if (isTrialExpired) {
      setCurrentStep('expired');
    }
  }, [isTrialExpired]);

  // Handle subject selection complete
  const handleSubjectsComplete = (subjects: string[]) => {
    setSelectedSubjects(subjects);
    onSaveSubjects(subjects);
    setCurrentStep('quiz');
  };

  // Handle quiz complete
  const handleQuizComplete = (results: TrialQuizResults) => {
    setQuizResults(results);
    onSaveResults(results);
    setCurrentStep('score');
  };

  // Handle continue to dashboard (starts the 30-min timer)
  const handleContinueToDashboard = () => {
    onStartTrialTimer();
    setCurrentStep('dashboard');
  };

  // Handle review questions
  const handleReviewQuestions = () => {
    setCurrentStep('review');
  };

  // Handle back from review
  const handleBackFromReview = () => {
    setCurrentStep('dashboard');
  };

  // Render based on current step
  switch (currentStep) {
    case 'subject-picker':
      return (
        <FreeTrialSubjectPicker
          onComplete={handleSubjectsComplete}
          onCancel={onCancel}
        />
      );

    case 'quiz':
      return (
        <TrialQuiz
          subjects={selectedSubjects}
          onComplete={handleQuizComplete}
          onExit={onCancel}
        />
      );

    case 'score':
      return quizResults ? (
        <TrialScoreScreen
          results={quizResults}
          onContinue={handleContinueToDashboard}
        />
      ) : null;

    case 'dashboard':
      return quizResults ? (
        <TrialDashboard
          results={quizResults}
          timeRemaining={timeRemaining || 0}
          onUpgrade={onUpgrade}
          onReviewQuestions={handleReviewQuestions}
        />
      ) : null;

    case 'review':
      return quizResults ? (
        <TrialQuestionReview
          results={quizResults}
          onBack={handleBackFromReview}
        />
      ) : null;

    case 'expired':
      return <TrialEndedScreen onUpgrade={onUpgrade} />;

    default:
      return null;
  }
};
